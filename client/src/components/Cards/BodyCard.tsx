import type * as Types from './../../types'
import { ECardsType } from '../../helpers/enums'
import {format, parseISO, intervalToDuration} from 'date-fns'
import {useEffect, useState } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'

export default function BodyCard({...card}: Types.ICard) {
  
  const [years, setYears] = useState(0);
const [months, setMonths] = useState(0);
const [days, setDays] = useState(0);
const [circularBar, setCircularBar] = useState(0);
const [hours, setHours] = useState(0);
const [minutes, setMinutes] = useState(0);
const [seconds, setSeconds] = useState(0);

const isStop = card.cardType.type === ECardsType.STOP

useEffect(() => {
  const intervalId = setInterval(() => {
    if (card.cardType.stops.length === 0) {
      const date = new Date();
      const timer = intervalToDuration({
        start: parseISO(card.createdAt),
        end: date,
      });
      
      setYears(timer.years || 0);
      setMonths(timer.months || 0);
      setDays(timer.days || 0);
      setHours(timer.hours || 0);
      setMinutes(timer.minutes || 0);
      setSeconds(timer.seconds || 0);
      setCircularBar(timer.seconds || 0);
    }
  }, 1000);

  return () => {
    clearInterval(intervalId);
  }
}, [card.createdAt]);


const prettyCratedAT = parseISO(card.createdAt)

  return (
    <article className="">
        <div className="card-header">
          <div className='card-title'>{card.title}</div>
          <span className='bi bi-three-dots card-menu'></span>
        </div>
        <div className="card-body">
          <div className='innerBody'>
            {isStop 
            ? <div className='timer-hoursMinutes-container'>
              <div className='timer-hoursMinutes'>
              <CircularProgressbar value={circularBar} maxValue={60} />
                <div>
                  <span className='hoursMinutes'>{`${hours}:${minutes}`}</span>
              </div>
            </div> 
            </div> 
            : <div className='timer-checkDays'></div>
            }
            <div className='right-info'>
              <div className='total'>
                <p>Total Alcanzado</p>
                <div className='progression-total'>
                  <p className='inner-progression-text'>{`${years}A`}<span className='separator'></span></p>
                  <p className='inner-progression-text'>{`${months}M`}<span className='separator'></span></p>
                  <p className='inner-progression-text'>{`${days}D`}</p>
                </div>
              </div>
              <div className='current-goal'>
                <p>Meta actual <span>3 MESES</span></p>
                <div className='progression-goal'>
                  <div className='progression-bar'>
                    <span className='percent'>34%</span>
                  </div>
                </div>
                <div className='streak'>
                    <p> Racha <i className='bi bi-star-fill'></i>
                    <i className='bi bi-star-fill star'></i>
                    <i className='bi bi-star-fill star'></i>
                    <i className='bi bi-star-fill star'></i>
                    <i className='bi bi-star-fill star'></i></p>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-buttons">
          <div className='play-stop'>
          <div className='play'><i className='bi bi-play play-icon'></i></div>
          <div className='stop'><i className='bi bi-stop stop-icon'></i></div>
          </div>
          <div className='statistics'><i className='bi bi-bar-chart statistics-icon'></i></div>
        </div>
        <p className="card-footer">{`creado - ${format(prettyCratedAT, 'dd/MM/yy')}`}
        </p>
    </article>
  )
}
