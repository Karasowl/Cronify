import BodyCard from "../Cards/BodyCard"
import {useEffect, useState, useContext } from 'react'
import fetchCards from "../../helpers/fetch"
import userContext from "../../context/User-context"

type TCard = {
title:string
_id:string
}

const url = `http://localhost:9785/api/get-cards`


export default function Home() {
  const [cards, setCards] = useState<string[]>([])

const userState = useContext(userContext)
useEffect(() => {
    const fetching = async () => {
      const response = await fetchCards({url})
      const data = await (response as Response).json()
      console.log(data)
      const cardData = data.map(({title, _id}: TCard) => [_id, title]);
      setCards(cardData)
    }
    fetching()
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
