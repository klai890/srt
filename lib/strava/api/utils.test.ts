import ActivityWeek from "../models/ActivityWeek";
import {setupCsvTable} from './utils'
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStravaData } from "./utils";


const mockFetch = vi.fn();

beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});


describe("getStravaData()", () => {
    it("should fetches activities correctly", async () => {
        const mock_data = [
            { distance: 10000, name: "Morning Run", start_date: '2018-05-02T12:15:09Z', type: 'Run'},
            { distance: 30000, name: "Morning Ride", start_date: '2018-05-03T15:15:09Z', type: 'Ride'},
            { distance: 6000, name: "Morning Run", start_date: '2018-05-03T12:15:09Z', type: 'Run'},
            { distance: 30000, name: "Morning Ride", start_date: '2018-05-03T15:15:09Z', type: 'Ride'},
        ]
    
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mock_data),
        })

        const before = new Date("2018-05-04");
        const after = new Date("2018-05-02");
        const strava_id = 12345;
        const access_token = "abcdefg";

        const result = await getStravaData(strava_id, access_token, before, after);

        expect(result.raw_data).toHaveLength(2);
    })

    it("should handle paginated responses correctly and return all data", async () => {
        const mock_run = {
            distance: 10000,
            name: '10km run',
            start_date: '2018-05-02T12:15:09Z',
            type: 'Run',
        }
        const mock_ride = {
            distance: 30000,
            name: '30km ride',
            start_date: '2018-05-13T12:15:09Z',
            type: 'Ride',
        }
        const mock_run2 = {
            distance: 5000,
            name: '5km run',
            start_date: '2018-05-12T12:15:09Z',
            type: 'Run',
        }
        const page_one = new Array(200);
        page_one.fill(mock_run, 0, 50);
        page_one.fill(mock_ride, 50, 100);
        page_one.fill(mock_run, 100, 150);
        page_one.fill(mock_ride, 150, 200);

        const page_two = new Array(200);
        page_two.fill(mock_ride, 0, 40);
        page_two.fill(mock_run2, 40, 200);

        const page_three = new Array(100);
        page_three.fill(mock_run, 0, 100);


        mockFetch
        .mockResolvedValueOnce({
            json: () => Promise.resolve(page_one),
        })
        .mockResolvedValueOnce({
            json: () => Promise.resolve(page_two),
        })
        .mockResolvedValueOnce({
            json: () => Promise.resolve(page_three),
        });

        const before = new Date("2018-05-14");
        const after = new Date("2018-05-02");
        const strava_id = 12345;
        const access_token = "abcdefg";

        const result = await getStravaData(strava_id, access_token, before, after);
        expect(result.raw_data).toHaveLength(360);
        expect(result.week_data).toHaveLength(2);
    })

    it("should return raw_data in chronological order", async () => {
        const page_one = [
            {
                distance: 5000,
                name: '5km run 8/30', 
                start_date: '2025-08-30T07:40:02Z',
                type: 'Run',
            },
            {
                distance: 5000,
                name: '5km run 8/15', 
                start_date: '2025-08-15T07:40:02Z',
                type: 'Run',
            },
            {
                distance: 5000,
                name: '5km run 9/4', 
                start_date: '2025-09-04T07:40:02Z',
                type: 'Run',
            }
        ]

        mockFetch
        .mockResolvedValueOnce({
            json: () => Promise.resolve(page_one),
        })

        const before = new Date("2025-09-05");
        const after = null;
        const strava_id = 12345;
        const access_token = "abcdefg";

        const result = await getStravaData(strava_id, access_token, before, after);
        var dates : Array<Date> = result.raw_data.map(data => new Date(data.start_date));
        expect(dates.map(d => d.getTime())).toEqual([
            new Date('2025-08-15T07:40:02Z').getTime(),
            new Date('2025-08-30T07:40:02Z').getTime(),
            new Date('2025-09-04T07:40:02Z').getTime()
        ]);
    })
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