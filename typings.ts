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
