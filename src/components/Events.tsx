import { useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import type { ToolbarInput } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import eventsJSON from '../data/events.json';
import heroData from '../data/heroimages.json';
import type { HeroImage } from '../types/data';
import './Events.css';

const typedHeroData = heroData as HeroImage[];

const MOBILE_BREAKPOINT = 640;

const getViewForWidth = (width: number) => (width < MOBILE_BREAKPOINT ? 'listWeek' : 'listMonth');

type ToolbarConfig = {
  headerToolbar: ToolbarInput;
  footerToolbar: ToolbarInput | false;
};

const getToolbarConfig = (width: number): ToolbarConfig => {
  if (width < MOBILE_BREAKPOINT) {
    return {
      headerToolbar: { start: 'title', center: '', end: '' },
      footerToolbar: { start: 'prev,next', center: '', end: '' }
    };
  }

  return {
    headerToolbar: { start: 'title', center: '', end: 'prev,next' },
    footerToolbar: false
  };
};

// Put location information in the event's title
// { title: 'Meeting at Jim's Deli',
// start: '2024-03-16T10:30:00',
// end: '2024-03-16T12:30:00',
// url: 'http://zoom.com/roomxyz' }

const Events: React.FC = () => {
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const hero = typedHeroData.find(h => h.name === 'events');

  useEffect(() => {
    if (!calendarRef.current || typeof window === 'undefined') {
      return;
    }

    const width = window.innerWidth;
    const { headerToolbar, footerToolbar } = getToolbarConfig(width);

    const calendar = new Calendar(calendarRef.current, {
      plugins: [listPlugin],
      initialView: getViewForWidth(width),
      events: eventsJSON,
      height: 'auto',
      contentHeight: 'auto',
      expandRows: true,
      progressiveEventRendering: true,
      buttonText: {
        today: 'Today'
      },
      headerToolbar,
      footerToolbar,
      views: {
        listWeek: {
          listDayFormat: { weekday: 'long', month: 'short', day: 'numeric' },
          listDaySideFormat: false
        },
        listMonth: {
          listDayFormat: { weekday: 'short' },
          listDaySideFormat: { month: 'short', day: 'numeric' }
        }
      },
      windowResize: arg => {
        const nextWidth = window.innerWidth;
        const nextView = getViewForWidth(nextWidth);
        if (arg.view.type !== nextView) {
          arg.view.calendar.changeView(nextView);
        }

        const toolbar = getToolbarConfig(nextWidth);
        arg.view.calendar.setOption('headerToolbar', toolbar.headerToolbar);
        arg.view.calendar.setOption('footerToolbar', toolbar.footerToolbar);
      }
    });

    calendar.render();
    return () => calendar.destroy();
  }, []);

  return (
    <section className={`hero ${hero?.src ? hero.shade : hero?.shade === 'dark' ? 'black' : 'white'}`} id="events">
      {hero && (
        <>
          <img
            className="hero-bg"
            src={hero.src}
            alt={hero.alt}
          />
          <div className="hero-overlay" />
        </>
      )}
      <div className="hero-content">
        <div className="events-content">
          <h1>Events</h1>
          <div ref={calendarRef} id='calendar'></div>
        </div>
      </div>
    </section>
  );
};

export default Events;