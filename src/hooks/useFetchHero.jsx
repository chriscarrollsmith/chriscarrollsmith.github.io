import { useState, useEffect } from 'react';
import useFetchContent from './useFetchContent';

function useFetchHero(heroName, url = 'data/heroimages.json') {
    const [hero, setHero] = useState(null);
    const heroData = useFetchContent(url);

    useEffect(() => {
        if (heroData) {
            const foundHero = heroData.find(h => h.name === heroName);
            setHero(foundHero);
        }
    }, [heroName, heroData]);

    return hero;
}

export default useFetchHero;
