import ActivityWeek from "../models/ActivityWeek";
import {setupCsvTable} from './utils'
import {expect, jest, test} from '@jest/globals';


const mockData: ActivityWeek[] = [
    {
      week: '3/17/2025',
      monday: 3,
      tuesday: 4,
      wednesday: 0,
      thursday: 2,
      friday: 1,
      saturday: 0,
      sunday: 5,
      mileage: 15
    },
    {
      week: '3/24/2025',
      monday: 2,
      tuesday: 3,
      wednesday: 2,
      thursday: 1,
      friday: 4,
      saturday: 3,
      sunday: 2,
      mileage: 17
    }
]

const bf : Date = new Date('3/23/25');
const af : Date = new Date('3/31/25');

/********************** TESTS *************************/
test("getStravaData() works as expected", () => {
    // todo
})

test("activityMileage() works as expected", () => {
    // todo
})

test("setupCsvTable() works as expected", () => {
    var oldest : Date = new Date('8/3/2025');
    var newest : Date = new Date('8/25/2025');
    var table = [
        {
            'week': '7/28/2025',
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 0,
            'mileage': 0
        },
        {
            'week': '8/4/2025',
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 0,
            'mileage': 0
        },
        {
            'week': '8/11/2025',
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 0,
            'mileage': 0
        },
        {
            'week': '8/18/2025',
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 0,
            'mileage': 0
        },
        {
            'week': '8/25/2025',
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 0,
            'mileage': 0
        }
    ];
    var csvTable : Array<ActivityWeek> = [];
    setupCsvTable(csvTable, oldest, newest);
    expect(csvTable).toEqual(table);
})


test("addData() works as expected", () => {
    //  todo
})

test("prettify() works as expected", () => {
    // todo
})