import * as Types from '../../types'
import {format, parseISO, formatDistanceToNow} from 'date-fns'

export default function BodyCard({...card}: Types.ICard) {

  // function cardResolver (cardType){
  //     if(cardType.type === Types.ECardsType.DO){

  //     }
  // }

  const prettyCratedAT = parseISO(card.createdAt)

  return (
    <article className="">
        <div className="card-header">{card.title}
        </div>
        <div className="card-body">
        </div>
        <div className='card-goals-achieved'></div>
        <div className="stars">
        </div>
        <div className="card-buttons">
        </div>
        <p className="card-footer">{`creado - ${formatDistanceToNow(prettyCratedAT)}`}
        </p>
    </article>
  )
}
