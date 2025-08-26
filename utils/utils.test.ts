import { prevMon } from "./utils";

test("prevMon() works as expected", () => {
    // Case 1: Non-Monday
    var date1 : Date = new Date('8/7/2025'); // Thursday
    expect(prevMon(date1)).toEqual(new Date('8/4/2025'));

    // Case 2: Monday, 12am
    var date2 : Date = new Date(2025, 7, 4, 0, 0, 0); // Monday 8/4/25 at 10:30am
    expect(prevMon(date2)).toEqual(new Date('8/4/2025'));

    // Case 3: Monday, after 12am
    var date3 : Date = new Date(2025, 7, 4, 23, 59, 59); // Monday 8/4/25 at 10:30am
    expect(prevMon(date3)).toEqual(new Date('8/4/2025'));
})
