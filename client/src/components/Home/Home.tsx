import BodyCard from "../Cards/BodyCard"
import {useEffect, useState } from 'react'
import {fetching} from '../../helpers/Fetch'

type TCard = {
title:string
}

const url = `http://localhost:9785/api/get-cards`


export default function Home() {
  const [cards, setCards] = useState<string[]>([]);
  
  const fetchCards = async () => {
    const data = await fetching(url)
    console.log(data)
    const cardTitles = data.map((obj: TCard) => obj.title);
    setCards(cardTitles)
  }
  
  useEffect(() => {
    fetchCards()
  },[])


  return (
    <div id="home" className='container col-12 d-flex justify-content-end align-items-center flex-column mb-5'>
      {cards.length > 0 && cards.map((title) => {
      return (
      <div className="body-card">
      <BodyCard key={title} title={title}/>
      </div>
      )
      })}
    </div>
  );
}
