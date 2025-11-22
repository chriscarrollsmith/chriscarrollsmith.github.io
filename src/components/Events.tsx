import { useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import eventsJSON from '../data/events.json';
import heroData from '../data/heroimages.json';
import type { HeroImage } from '../types/data';
import './Events.css';

const typedHeroData = heroData as HeroImage[];

// Put location information in the event's title
// { title: 'Meeting at Jim's Deli',
// start: '2024-03-16T10:30:00',
// end: '2024-03-16T12:30:00',
// url: 'http://zoom.com/roomxyz' }

const Events: React.FC = () => {
  const calendarRef = useRef(null);
  const hero = typedHeroData.find(h => h.name === 'events');

  useEffect(() => {
    if (calendarRef.current) {
      const calendar = new Calendar(calendarRef.current, {
        plugins: [listPlugin],
        initialView: 'listMonth',
        events: eventsJSON,
        height: 'auto',
        headerToolbar: {
          right: 'prev,next'
        },
      });
      calendar.render();

      // Optional: Return a cleanup function to destroy the calendar when the component unmounts
      return () => calendar.destroy();
    }
  }, []); // Empty dependency array means this effect runs once after the initial render

  return (
    <section className={hero?.src ? hero.shade : hero?.shade === "dark" ? "black" : "white"} id="events-section">
      {hero && (
        <>
          <img
            className="background"
            src={hero.src}
            alt={hero.alt}
          />
          <div className="events-content">
            <h1>Events</h1>
            <div ref={calendarRef} id='calendar'></div>
          </div>
        </>
      )}
    </section>
  );
};

export default Events;