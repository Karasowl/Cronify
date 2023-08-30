import BodyCard from "../Cards/BodyCard"
import {useEffect, useState } from 'react'
import {fetching} from '../../helpers/fetch'

type TCard = {
title:string
_id:string
}

const url = `http://localhost:9785/api/get-cards`


export default function Home() {
  const [cards, setCards] = useState<string[]>([]);
  
  const fetchCards = async () => {
    const data = await fetching(url)
    console.log(data)
    const cardData = data.map(({title, _id}: TCard) => [_id, title]);
    setCards(cardData)
  }
  
  useEffect(() => {
    fetchCards()
  },[])


  return (
    <div id="home" className=''>
      {cards.length > 0 && cards.map((data) => {
      const [_id, title] = data
      
      return (
      <div key={_id} className="body-card">
      <BodyCard key={_id} title={title}/>
      </div>
      )
      })}
    </div>
  );
}
