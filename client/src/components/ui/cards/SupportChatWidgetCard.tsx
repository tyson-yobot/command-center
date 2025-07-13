import { useEffect } from 'react';

const SupportChatWidgetCard = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.zdassets.com/ekr/snippet.js?key=6ca311e9-c90c-43b3-ae4b-2bd24c0ca6b4';
    script.async = true;
    script.id = 'ze-snippet';
    document.body.appendChild(script);
  }, []);

  return null;
};

export default SupportChatWidgetCard;
