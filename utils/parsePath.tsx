/**
 * 
 * @param path : The path
 * @returns : The parameters in the path
 */
function parsePath(path: string){

    // EXAMPLE VALUE: /sheets#state=pass-through%20value&access_token=ya29.a0AVvZVsokVoHGjTXhxB8RAjWmEHUczu2EqE5aTOkHan0Ki5P6wq4lxXAtxcGehMPpm5_eKJTZSoT31EOlGR24uAJd1QXdUCe9SXEJmqEzpuyw5BhvTRcpEp4hpHaD0NZW3yNyW1lbSNhwfCKJ5L7Vsgp8J6JkaCgYKAakSARISFQGbdwaIVdS7-rvzngla9kByW5VbLw0163&token_type=Bearer&expires_in=3599&scope=profile%20https://www.googleapis.com/auth/userinfo.profile
    const params = {}
    
    // Grab everything after an & and between =, that is the key name
    var indexAmp = path.indexOf('&');
    var indexEq = path.indexOf('=', indexAmp);

    // /sheets#state=pass-through%20value
    // &access_token=ya29.a0AVvZVsokVoHGjTXhxB8RAjWmEHUczu2EqE5aTOkHan0Ki5P6wq4lxXAtxcGehMPpm5_eKJTZSoT31EOlGR24uAJd1QXdUCe9SXEJmqEzpuyw5BhvTRcpEp4hpHaD0NZW3yNyW1lbSNhwfCKJ5L7Vsgp8J6JkaCgYKAakSARISFQGbdwaIVdS7-rvzngla9kByW5VbLw0163
    // &token_type=Bearer
    // &expires_in=3599
    // &scope=profile%20https://www.googleapis.com/auth/userinfo.profile


    while (indexAmp != -1) {
        var key = path.substring(indexAmp + 1, indexEq);
        var endValue;
        indexAmp = path.indexOf('&', indexAmp + 1);
        
        // endValue
        if (indexAmp == -1) endValue = path.length;
        else endValue = indexAmp;

        var value = path.substring(indexEq + 1, endValue);
        params[key] = value;

        indexEq = path.indexOf('=', indexEq + 1);
    }
    

    // Grab everything after the = and up to the next &, that is the value of the key
    // Return an object
    return params;
}

export default parsePath;