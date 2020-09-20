function Roller(height, aliasArray, randBetweenFunction) {
    this.height = height;
    this.aliases = aliasArray.slice();
    this.length = this.aliases.length;
    this.randomizer = randBetweenFunction === undefined ? bigInt.randBetween: randBetweenFunction;

    this.roll = function () {
        const get_length = this.randomizer("0", bigInt(this.length).minus("1"));
        const get_height = this.randomizer("0", bigInt(this.height).minus("1"));
        const alias = this.aliases[get_length];
        return bigInt(get_height).lt(alias.primaryHeight) ? alias.primary: alias.alternate;
    };

}