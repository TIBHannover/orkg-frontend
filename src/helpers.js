export const url = 'http://localhost:8000/api/';

/**
 * Sends simple GET request to the URL.
 */
export function GetRequester(url, onSuccess, onError) {
    fetch(url, { method: 'GET' })
            .then((response) => {
                console.log('Response type: ' + response.type);
                if (!response.ok) {
                    throw {message: 'Error response. (' + response.status + ') ' + response.statusText};
                } else {
                    return response.json();
                }
            })
            .then(onSuccess)
            .catch(onError);
}