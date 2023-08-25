


 export interface ICard extends Document{
    title:string,
    type: 'DO'|'STOP',
    starTime:number,
    days: object[],
    goals:object[],
    user: string
}
