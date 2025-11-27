import { useMemo, useState } from 'react';
import eventsJSON from '../data/events.json';
import heroData from '../data/heroimages.json';
import type { EventItem, HeroImage } from '../types/data';
import './Events.css';
import { compareAsc, format, isBefore, isSameDay, parseISO } from 'date-fns';

const typedHeroData = heroData as HeroImage[];
const typedEvents = eventsJSON as EventItem[];

const PAGE_SIZE = 2;

type BaseEvent = EventItem & {
  startDate: Date;
  endDate?: Date;
  isAllDay: boolean;
};

type DisplayEvent = BaseEvent & {
  status: 'past' | 'upcoming' | 'today';
};

const parsedEvents: BaseEvent[] = typedEvents
  .map(event => {
    const startDate = parseISO(event.start);
    const endDate = event.end ? parseISO(event.end) : undefined;
    const isAllDay = !event.start.includes('T');

    return {
      ...event,
      startDate,
      endDate,
      isAllDay
    };
  })
  .sort((a, b) => compareAsc(a.startDate, b.startDate));

const buildDisplayEvents = (now: Date): DisplayEvent[] =>
  parsedEvents.map(event => ({
    ...event,
    status: isSameDay(event.startDate, now)
      ? 'today'
      : isBefore(event.startDate, now)
        ? 'past'
        : 'upcoming'
  }));

const getInitialIndex = (events: DisplayEvent[]) => {
  if (events.length <= PAGE_SIZE) {
    return 0;
  }

  const firstUpcomingIndex = events.findIndex(event => event.status !== 'past');

  if (firstUpcomingIndex === -1) {
    return Math.max(events.length - PAGE_SIZE, 0);
  }

  if (firstUpcomingIndex === events.length - 1) {
    return Math.max(firstUpcomingIndex - (PAGE_SIZE - 1), 0);
  }

  return Math.min(firstUpcomingIndex, Math.max(events.length - PAGE_SIZE, 0));
};

const formatTimeWindow = (event: BaseEvent) => {
  if (event.isAllDay) {
    if (event.endDate && !isSameDay(event.startDate, event.endDate)) {
      return `Through ${format(event.endDate, 'EEE, MMM d')}`;
    }
    return 'All day';
  }

  if (event.endDate && isSameDay(event.startDate, event.endDate)) {
    return `${format(event.startDate, 'p')} – ${format(event.endDate, 'p')}`;
  }

  if (event.endDate) {
    return `${format(event.startDate, 'p')} → ${format(event.endDate, 'EEE, MMM d p')}`;
  }

  return format(event.startDate, 'p');
};

const Events: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'events');
  const [now] = useState(() => new Date());
  const events = useMemo(() => buildDisplayEvents(now), [now]);
  const [startIndex, setStartIndex] = useState(() => getInitialIndex(events));

  const totalEvents = events.length;
  const visibleEvents = events.slice(startIndex, startIndex + PAGE_SIZE);
  const hasEvents = totalEvents > 0;
  const canGoPrevious = startIndex > 0;
  const canGoNext = startIndex + PAGE_SIZE < totalEvents;

  const showingStart = Math.min(startIndex + 1, totalEvents);
  const showingEnd = Math.min(startIndex + PAGE_SIZE, totalEvents);

  const handlePrevious = () => {
    if (canGoPrevious) {
      setStartIndex(prev => Math.max(prev - PAGE_SIZE, 0));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setStartIndex(prev => Math.min(prev + PAGE_SIZE, Math.max(totalEvents - PAGE_SIZE, 0)));
    }
  };

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
          <header className="events-header">
            <h1>Events</h1>
            <p className="events-subhead">
              Workshops, talks, and community sessions about AI workflows and tooling.
            </p>
          </header>

          {!hasEvents && (
            <p className="events-empty">
              No events to show right now—check back soon or say hi on social media.
            </p>
          )}

          {hasEvents && (
            <>
              <ul className="events-list">
                {visibleEvents.map(event => (
                  <EventRow key={`${event.title}-${event.start}`} event={event} />
                ))}
              </ul>
              <div className="events-controls">
                <button
                  className="events-button"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  aria-label="Show earlier events"
                >
                  ← Earlier
                </button>
                <p className="events-count">
                  Showing {showingStart}–{showingEnd} of {totalEvents}
                </p>
                <button
                  className="events-button"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  aria-label="Show later events"
                >
                  Later →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

type EventRowProps = {
  event: DisplayEvent;
};

const formatLabel: Record<string, string> = {
  'in-person': 'In-person',
  'remote': 'Remote',
  'hybrid': 'Hybrid',
};

const EventRow: React.FC<EventRowProps> = ({ event }) => {
  const badgeLabel = event.status === 'past' ? 'Past event' : event.status === 'today' ? 'Today' : 'Upcoming';
  const badgeClass = `events-badge events-badge--${event.status}`;
  const dateLabel = format(event.startDate, 'EEE, MMM d');
  const timeLabel = formatTimeWindow(event);

  return (
    <li className={`events-item ${event.status === 'past' ? 'events-item--past' : ''}`}>
      <div className="events-item-top">
        <div>
          <p className="events-item-date">{dateLabel}</p>
          <p className="events-item-time">{timeLabel}</p>
        </div>
        <div className="events-badges">
          <span className={badgeClass}>{badgeLabel}</span>
          {event.format && (
            <span className={`events-badge events-badge--format events-badge--${event.format}`}>
              {formatLabel[event.format]}
            </span>
          )}
        </div>
      </div>
      <p className="events-item-title">{event.title}</p>
      {event.location && (
        <p className="events-item-location">{event.location}</p>
      )}
      {(event.eventUrl || event.meetingUrl || event.videoUrl || event.slidesUrl || event.codeUrl) && (
        <div className="events-meta">
          {event.eventUrl && (
            <a className="events-link" href={event.eventUrl} target="_blank" rel="noreferrer">
              Event details
            </a>
          )}
          {event.meetingUrl && (
            <a className="events-link" href={event.meetingUrl} target="_blank" rel="noreferrer">
              Join meeting
            </a>
          )}
          {event.videoUrl && (
            <a className="events-link" href={event.videoUrl} target="_blank" rel="noreferrer">
              Video
            </a>
          )}
          {event.slidesUrl && (
            <a className="events-link" href={event.slidesUrl} target="_blank" rel="noreferrer">
              Slides
            </a>
          )}
          {event.codeUrl && (
            <a className="events-link" href={event.codeUrl} target="_blank" rel="noreferrer">
              Code
            </a>
          )}
        </div>
      )}
    </li>
  );
};

export default Events;