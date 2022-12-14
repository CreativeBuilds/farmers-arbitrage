/**
 * 
 * @param slug the unique id of the opensea collection
 * @returns a collection stats object
 */
export const GetCollectionStats = async (slug: string): Promise<OpenseaCollectionStats> => {
    return fetch(`https://api.opensea.io/api/v1/collection/${slug}/stats`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "if-modified-since": "Thu, 11 Aug 2022 22:59:22 GMT",
            "x-api-key": "fbb33cd31dcf4624b4205021e21be2df"
        },
        "referrer": "https://app.nftfi.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
        }).then(x => x.json())
}

export const GetSlug = async (address: string): Promise<string> => {
    return fetch(`https://api.opensea.io/api/v1/asset_contract/${address}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "if-modified-since": "Thu, 11 Aug 2022 23:22:20 GMT",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-gpc": "1",
        "x-api-key": "fbb33cd31dcf4624b4205021e21be2df"
      },
      "referrer": "https://app.nftfi.com/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"}).then(x => x.json()).then(x => x?.collection?.slug).then(x => {
        if(!x) throw new Error("No slug found for address")
        return x
      })
}