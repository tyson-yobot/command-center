const useTextToSpeech = () => {
  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };
  return { speak };
};

export default useTextToSpeech;
