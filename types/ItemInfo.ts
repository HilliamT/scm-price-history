export default interface ItemInfo {
    market_hash_name: string,
    appid: number,
    icon_url: string,
    type: string,
    descriptions: {
        type: string,
        value: string,
        color?: string
    }[];
}