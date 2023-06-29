import { useState, useEffect } from 'react';

function useFetchContent(importURL, attribute) {
    const [content, setContent] = useState(null);

    useEffect(() => {
        fetch(importURL)
            .then(response => response.json())
            .then(data => {
                // If an attribute is specified, return that attribute's value. 
                // If not, return the entire data object.
                setContent(attribute ? data[attribute] : data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, [importURL, attribute]);

    return content;
}

export default useFetchContent;
