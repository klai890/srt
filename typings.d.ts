export type GoogleUser = {
    family_name: string,
    name: string,
    picture: string,
    locale: string,
    given_name: string,
    id: string
}

export type GoogleParams = {
    access_token: string,
    token_type: string,
    expires_in: string,
    scope: string
}

export type NewSpreadsheet =  {
    spreadsheetId?: string,
    properties?: SpreadsheetProperties,
    sheets?: Array<object>,
    namedRanges?: Array<object>,
    spreadsheetUrl?: string,
}   

type SpreadsheetProperties = {
    autoRecalc?: string,
    defaultFormat?: object,
    locale?: string,
    title?: string
}

export type StravaSession = {
    name?: string,
    user?: string,
    expires?: string,
    accessToken?: string,
    refreshToken?: string,
    error?: string
  }
  

export type Token = {
    name?: string,
    expires?: string,
    accessToken?: string,
    refreshToken?: string,
    error?: string

}
