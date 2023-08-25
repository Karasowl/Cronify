import { Button } from "react-bootstrap";
import BottomNav from "../BottomNav/BottomNav"
import BodyCard from "../Cards/BodyCard"
import {useState } from 'react'

type TCard = {
title:string
}

export default function BodyApp() {
  const [cards, setCards] = useState<string[]>([]);

  async function fetchCards() {
    try {
      const response = await fetch(`http://localhost:9785/api/get-cards`)
      const data = await response.json()
      const cardTitles = data.map((obj: TCard) => obj.title);
      setCards(cardTitles);
    } catch(err){
      console.log(err)
    }
  }

  return (
    <div className='container col-12 d-flex justify-content-end align-items-center flex-column mb-5'>
      {cards.length > 0 && cards.map((title) => {
      return (
      <div className="body-card">
      <BodyCard key={title} title={title}/>
      </div>
      )
      })}
      <Button onClick={fetchCards}>Fetch</Button>
      <BottomNav/>
    </div>
  );
}
