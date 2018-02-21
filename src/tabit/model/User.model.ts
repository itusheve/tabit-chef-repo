export class User {
    first: string;
    last: string;
    fullName: string;

    constructor(first: string, last: string) {
        this.first = first;
        this.last = last;
        this.fullName = `${this.first} ${this.last}`;
    }
}
