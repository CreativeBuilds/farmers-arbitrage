export const GetCollectionActivity = async (collection: string = "0xA1D4657e0E6507D5a94d06DA93E94dC7C8c44b51"): Promise<any> => {
    return fetch(`https://sudoapi.xyz/v1/activity/collection/${collection}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "Referer": "https://sudoswap.xyz/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    }).then(x => x.json())
}

export const GetCollectionListings = async (collection: string = "0xA1D4657e0E6507D5a94d06DA93E94dC7C8c44b51"): Promise<any> => {
    return fetch(`https://sudoapi.xyz/v1/pairs/nft/${collection}`, {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9",
        },
        "referrer": "https://sudoswap.xyz/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
      }).then(x => x.json())
}