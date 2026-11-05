"""Generate the acceptance test data in acceptance_test_data/.

Every case is run through the real lambda handler. basic_cases.json and
performance_cases.json are the specification for ports of this service to other
languages. run_results.json holds timings for this machine and is not committed.
"""

import gc
import json
import os
import platform
import time
import tracemalloc
from dataclasses import dataclass
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

from lambda_function import lambda_handler


@dataclass(frozen=True)
class AcceptanceCase:
    build_string: str
    description: str


BASIC_CASES = [
    # The examples from the allthedice frontend (index.html, "exampleClickable").
    AcceptanceCase("Die(6)", "a six-sided die"),
    AcceptanceCase("2*Die(4)&3*Die(8)", "2 four-sided dice and 3 eight-sided dice"),
    AcceptanceCase("3*ModDie(6, 2)", "3(D6+2): three * (six-sided die + 2)"),
    AcceptanceCase(
        "5*WeightedDie({1:1, 2: 2})",
        "5 * (2-sided die that rolls 2 twice as often as 1)",
    ),
    AcceptanceCase(
        "5*ModWeightedDie({1:1, 2: 2}, 5)",
        "5(D2+5): 5 * (2-sided die that rolls 7 (2+5) twice as often as 6 (1+5))",
    ),
    AcceptanceCase(
        "2*StrongDie(Die(6), 3)",
        "2 dice that roll D6X3. each die rolls 3, 6, 9, ... 18",
    ),
    AcceptanceCase(
        "2*Die(6)&Modifier(-3)",
        "modifier adds to the overall dice: 2D6-3 (2 six-sided dice minus 3)",
    ),
    AcceptanceCase(
        "Exploding(Die(6))",
        "an exploding D6 is a six-sided die that you keep rolling every time you roll a six",
    ),
    AcceptanceCase(
        "ExplodingOn(Die(6), (1, ))",
        "a six-sided die that you keep rolling every time you roll a 1",
    ),
    AcceptanceCase(
        "ExplodingOn(Die(6), (1, 6))",
        "a six-sided die that you keep rolling every time you roll a 1 or a 6",
    ),
    AcceptanceCase(
        "BestOfDicePool(DicePool(Die(6), 3), 2)", "take the 2 best rolls of 3D6"
    ),
    AcceptanceCase(
        "WorstOfDicePool(DicePool(Die(6), 4), 2)", "take the 2 worst rolls of 4D6"
    ),
    AcceptanceCase(
        "UpperMidOfDicePool(DicePool(Die(6), 7), 4)",
        "take the upper middle four rolls of 7D6",
    ),
    AcceptanceCase(
        "LowerMidOfDicePool(DicePool(Die(6), 7), 4)",
        "take the lower middle four rolls of 7D6",
    ),
    # Inputs that make an empty table.
    AcceptanceCase("", "an empty string makes an empty table"),
    AcceptanceCase("   ", "whitespace only makes an empty table"),
    # One build string for each error type the handler can return.
    AcceptanceCase(
        "2*Die(5) & *Die(4)", "ValueError: the delimiter with no number before it"
    ),
    AcceptanceCase(
        "100*Die(100)",
        "ValueError: the record is over the lambda's max_dice_value of 4000",
    ),
    AcceptanceCase(
        "3 die(3)", "SyntaxError: a number and a die with no delimiter between them"
    ),
    AcceptanceCase("3 & die(3)", "AttributeError: a bare number where a die should be"),
    AcceptanceCase("notadie(5)", "ParseError: a die class the parser does not know"),
    AcceptanceCase("die(1, 2, 3)", "ParseError: too many parameters for the die class"),
    AcceptanceCase("die(30000)", "LimitsError: a die size over the parser's limit"),
    AcceptanceCase("die(-1)", "InvalidEventsError: a die with no faces"),
    AcceptanceCase("-2*die(2)", "DiceRecordError: a negative number of dice"),
]

# Each of these sits at or just under the lambda's max_dice_value of 4000.
PERFORMANCE_CASES = [
    AcceptanceCase(
        "40*Die(100)", "many medium dice: 40 hundred-sided dice, exactly at the limit"
    ),
    AcceptanceCase(
        "1000*Die(4)", "many small dice: 1000 four-sided dice, exactly at the limit"
    ),
    AcceptanceCase(
        "8*Die(500)",
        "largest dice: 8 dice of the largest allowed size, exactly at the limit",
    ),
    AcceptanceCase(
        "25*Die(100)"
        "&5*ModDie(100, 5)"
        "&5*StrongDie(Die(100), 3)"
        "&39*WeightedDie({1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10})"
        "&10*ModWeightedDie({1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10}, 5)"
        "&Modifier(7)",
        "mixed dice types just under the limit",
    ),
    AcceptanceCase(
        "BestOfDicePool(DicePool(Die(6), 20), 10)",
        "a dice pool near the largest allowed pool size: the best 10 of 20 six-sided dice",
    ),
]

TIMING_RUNS = 5


@dataclass(frozen=True)
class GeneratedCase:
    case: AcceptanceCase
    status_code: int
    response: dict

    def to_json(self) -> dict:
        return {
            "description": self.case.description,
            "buildString": self.case.build_string,
            "statusCode": self.status_code,
            "response": self.response,
        }


@dataclass(frozen=True)
class Measurement:
    case: AcceptanceCase
    wall_time_seconds: float
    cpu_time_seconds: float
    peak_memory_bytes: int

    def to_json(self) -> dict:
        return {
            "description": self.case.description,
            "buildString": self.case.build_string,
            "wallTimeSeconds": self.wall_time_seconds,
            "cpuTimeSeconds": self.cpu_time_seconds,
            "peakMemoryBytes": self.peak_memory_bytes,
        }


@dataclass(frozen=True)
class MachineInfo:
    platform_name: str
    cpu: str
    cpu_count: int
    python_implementation: str
    python_version: str
    dicetables_version: str

    @classmethod
    def current(cls) -> "MachineInfo":
        return cls(
            platform_name=platform.platform(),
            cpu=get_cpu_model(),
            cpu_count=os.cpu_count(),
            python_implementation=platform.python_implementation(),
            python_version=platform.python_version(),
            dicetables_version=version("dicetables"),
        )

    def to_json(self) -> dict:
        return {
            "platform": self.platform_name,
            "cpu": self.cpu,
            "cpuCount": self.cpu_count,
            "pythonImplementation": self.python_implementation,
            "pythonVersion": self.python_version,
            "dicetablesVersion": self.dicetables_version,
        }


@dataclass(frozen=True)
class RunResults:
    generated_at: str
    machine: MachineInfo
    measurements: list[Measurement]

    def to_json(self) -> dict:
        return {
            "generatedAt": self.generated_at,
            "machine": self.machine.to_json(),
            "measurement": {
                "measured": "make_case: lambda_handler plus decoding its JSON body",
                "timingRuns": TIMING_RUNS,
                "wallTimeSeconds": "minimum over runs, time.perf_counter",
                "cpuTimeSeconds": "minimum over runs, time.process_time",
                "peakMemoryBytes": "tracemalloc peak during one separate run",
            },
            "results": [measurement.to_json() for measurement in self.measurements],
        }


def get_top_level_directory() -> Path:
    return Path(__file__).resolve().parent


def get_test_data_directory() -> Path:
    return get_top_level_directory() / "acceptance_test_data"


def get_basic_cases_file() -> Path:
    return get_test_data_directory() / "basic_cases.json"


def get_performance_cases_file() -> Path:
    return get_test_data_directory() / "performance_cases.json"


def get_run_results_file() -> Path:
    return get_test_data_directory() / "run_results.json"


def make_case(case: AcceptanceCase) -> GeneratedCase:
    event = {"body": {"buildString": case.build_string}, "isBase64Encoded": False}
    result = lambda_handler(event, None)
    return GeneratedCase(
        case=case,
        status_code=result["statusCode"],
        response=json.loads(result["body"]),
    )


def measure(case: AcceptanceCase) -> Measurement:
    """Time and memory for make_case, the same call that produced the case file."""
    wall_times = []
    cpu_times = []
    for _ in range(TIMING_RUNS):
        gc.collect()
        wall_start = time.perf_counter()
        cpu_start = time.process_time()
        make_case(case)
        wall_times.append(time.perf_counter() - wall_start)
        cpu_times.append(time.process_time() - cpu_start)

    # tracemalloc slows execution, so memory is measured in its own run.
    gc.collect()
    tracemalloc.start()
    make_case(case)
    _, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    return Measurement(
        case=case,
        wall_time_seconds=round(min(wall_times), 6),
        cpu_time_seconds=round(min(cpu_times), 6),
        peak_memory_bytes=peak_bytes,
    )


def get_cpu_model() -> str:
    cpuinfo = Path("/proc/cpuinfo")
    if cpuinfo.exists():
        for line in cpuinfo.read_text().splitlines():
            if line.startswith("model name"):
                return line.split(":", 1)[1].strip()
    return platform.processor() or "unknown"


def write_json(path: Path, data: list | dict) -> None:
    with open(path, "w") as json_file:
        json.dump(data, json_file, indent=2)


def write_minified_json(path: Path, data: list | dict) -> None:
    with open(path, "w") as json_file:
        json.dump(data, json_file, separators=(",", ":"))


def main() -> None:
    test_data_directory = get_test_data_directory()
    test_data_directory.mkdir(exist_ok=True)

    basic_cases = [make_case(case) for case in BASIC_CASES]
    write_json(get_basic_cases_file(), [case.to_json() for case in basic_cases])

    performance_cases = [make_case(case) for case in PERFORMANCE_CASES]
    for generated in performance_cases:
        if generated.status_code != 200:
            raise ValueError(
                f"performance case failed: {generated.case.description}: {generated.response}"
            )
    # Performance responses run to thousands of rows, so they are minified.
    write_minified_json(
        get_performance_cases_file(), [case.to_json() for case in performance_cases]
    )

    run_results = RunResults(
        generated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        machine=MachineInfo.current(),
        measurements=[measure(case) for case in PERFORMANCE_CASES],
    )
    write_json(get_run_results_file(), run_results.to_json())

    print(
        f"wrote {len(basic_cases)} basic cases and {len(performance_cases)} "
        f"performance cases to {test_data_directory}"
    )


if __name__ == "__main__":
    main()
