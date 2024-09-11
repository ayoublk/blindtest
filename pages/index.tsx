import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PlusCircle, MinusCircle, Play, Pause, RotateCcw, Edit, Save, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useLocalStorage } from '../hooks/useLocalStorage';

const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

const BlindTestApp = () => {
  const [songs, setSongs] = useLocalStorage('blindTestSongs', [
    { id: 1, title: 'Chanson N°1', answer: 'Réponse 1', revealed: false, youtubeId: 'dQw4w9WgXcQ' },
    { id: 2, title: 'Chanson N°2', answer: 'Réponse 2', revealed: false, youtubeId: 'y6120QOlsfU' },
    { id: 3, title: 'Chanson N°3', answer: 'Réponse 3', revealed: false, youtubeId: 'fJ9rUzIMcZQ' },
  ]);

  const [players, setPlayers] = useLocalStorage('blindTestPlayers', [
  ]);
  const [isClient, setIsClient] = useState(false);


  const [newPlayerName, setNewPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const playerRef = useRef<any>(null);

  
  const toggleReveal = (id: number) => {
    setSongs(songs.map(song => 
      song.id === id ? { ...song, revealed: !song.revealed } : song
    ));
  };

  const updateScore = (id: number, increment: number) => {
    setPlayers(players.map(player =>
      player.id === id ? { ...player, score: player.score + increment } : player
    ));
  };

  const addPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (trimmedName) {
      if (players.some(player => player.name.toLowerCase() === trimmedName.toLowerCase())) {
        setErrorMessage('Un joueur avec ce nom existe déjà.');
      } else {
        const newId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
        setPlayers([...players, { id: newId, name: trimmedName, score: 0 }]);
        setNewPlayerName('');
        setErrorMessage('');
      }
    } else {
      setErrorMessage('Le nom du joueur ne peut pas être vide.');
    }
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  const togglePlay = (id: number) => {
    if (currentlyPlaying === id) {
      playerRef.current?.pauseVideo();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying) {
        playerRef.current?.pauseVideo();
      }
      const song = songs.find(s => s.id === id);
      if (song) {
        playerRef.current?.loadVideoById(song.youtubeId);
        playerRef.current?.playVideo();
        setCurrentlyPlaying(id);
      }
    }
  };

  const startEditing = (song: any) => {
    setEditingSong({ ...song });
  };

  const saveSong = () => {
    setSongs(songs.map(song => 
      song.id === editingSong.id ? editingSong : song
    ));
    setEditingSong(null);
  };

  const updateEditingSong = (field: string, value: string) => {
    setEditingSong({ ...editingSong, [field]: value });
  };

return (
  <div className="flex flex-col md:flex-row h-screen bg-gray-100">
    <div className="w-full md:w-3/4 p-6 overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Blind Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map(song => (
          <Card key={song.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              {editingSong && editingSong.id === song.id ? (
                <div className="space-y-4">
                  <Input 
                    value={editingSong.title} 
                    onChange={(e) => updateEditingSong('title', e.target.value)}
                    placeholder="Titre de la chanson"
                  />
                  <Input 
                    value={editingSong.answer} 
                    onChange={(e) => updateEditingSong('answer', e.target.value)}
                    placeholder="Réponse"
                  />
                  <Input 
                    value={editingSong.youtubeId} 
                    onChange={(e) => updateEditingSong('youtubeId', e.target.value)}
                    placeholder="ID YouTube"
                  />
                  <Button onClick={saveSong} className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <Save className="h-4 w-4 mr-2" /> Sauvegarder
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">{song.title}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" size="icon" onClick={() => togglePlay(song.id)} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600">
                      {currentlyPlaying === song.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => toggleReveal(song.id)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600">
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => startEditing(song)} className="bg-blue-100 hover:bg-blue-200 text-blue-600">
                      <Edit className="h-5 w-5" />
                    </Button>
                  </div>
                  {song.revealed && (
                    <p className="mt-2 p-2 bg-green-100 text-green-800 rounded">{song.answer}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    <div className="w-full md:w-1/4 p-6 bg-white shadow-lg flex flex-col h-screen md:h-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">Joueurs</h2>
      <div className="flex-grow overflow-auto mb-6">
        <div className="space-y-4">
          {players.map(player => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{player.name}: {player.score}</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => updateScore(player.id, 1)} className="bg-green-100 hover:bg-green-200 text-green-600">
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => updateScore(player.id, -1)} className="bg-red-100 hover:bg-red-200 text-red-600">
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => removePlayer(player.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <Input
          type="text"
          placeholder="Nom du nouveau joueur"
          value={newPlayerName}
          onChange={(e) => {
            setNewPlayerName(e.target.value);
            setErrorMessage('');
          }}
          className="mb-2 w-full"
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
        )}
        <Button onClick={addPlayer} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
          Ajouter un joueur
        </Button>
      </div>
    </div>
    {isClient && (
      <YouTube
        videoId=""
        opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
        onReady={(event) => (playerRef.current = event.target)}
      />
    )}
  </div>
);
};

export default BlindTestApp;