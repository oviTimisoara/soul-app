const SOUNDTRACK = [
  {
    "id": "joy-1",
    "category": "joy",
    "kind": "recording",
    "title": "2020-09-30 - Easy Going - David Fesliyan",
    "duration": 191,
    "src": "media/music/joy/1.mp3",
    "crc": 1877605553,
    "size": 7655331
  },
  {
    "id": "joy-2",
    "category": "joy",
    "kind": "recording",
    "title": "Sitar for Deep Work Indian Classical Meditation Music for Sustained Attention",
    "duration": 2528,
    "src": "media/music/joy/2.mp3",
    "crc": 4136050676,
    "size": 37710023
  },
  {
    "id": "focus-1",
    "category": "focus",
    "kind": "recording",
    "title": "Ela Rose - I Can Feel (Official Music Video)",
    "duration": 178,
    "src": "media/music/focus/1.mp3",
    "crc": 3543182922,
    "size": 4264173
  },
  {
    "id": "focus-2",
    "category": "focus",
    "kind": "recording",
    "title": "opulenta music",
    "duration": 199,
    "src": "media/music/focus/2.mp3",
    "crc": 3180721661,
    "size": 3332973
  },
  {
    "id": "meditation-1",
    "category": "meditation",
    "kind": "recording",
    "title": "Liniștea budhistă",
    "duration": 170,
    "src": "media/music/meditation/1.mp3",
    "crc": 1328682726,
    "size": 3742048
  },
  {
    "id": "sad-1",
    "category": "sad",
    "kind": "recording",
    "title": "Forest Meditation",
    "duration": 226,
    "src": "media/music/sad/1.m4a",
    "crc": 4000344507,
    "size": 4220127
  },
  {
    "id": "anxious-1",
    "category": "anxious",
    "kind": "recording",
    "title": "Teddy Swims - Bad Dreams (Betty Aus Extended Edit)",
    "duration": 358,
    "src": "media/music/anxious/1.mp3",
    "crc": 1493112865,
    "size": 8593586
  },
  {
    "id": "anxious-2",
    "category": "anxious",
    "kind": "recording",
    "title": "Mambo yo slow",
    "duration": 262,
    "src": "media/music/anxious/2.mp3",
    "crc": 4239659079,
    "size": 4199853
  },
  {
    "id": "stressed-1",
    "category": "stressed",
    "kind": "recording",
    "title": "DJ Ricky Campanelli -  Negra Rumba -  2018",
    "duration": 313,
    "src": "media/music/stressed/1.mp3",
    "crc": 2356934798,
    "size": 7509357
  },
  {
    "id": "angry-1",
    "category": "angry",
    "kind": "recording",
    "title": "Arabic Deep House Mix 2026  Best Arabic Deep House  Exotic Sunset Chill Arab Deep Remix",
    "duration": 3637,
    "src": "media/music/angry/1.mp3",
    "crc": 47058797,
    "size": 61605934
  }
];
const localMusic = (() => {
  let opening;
  function open() {
    return opening ||= new Promise((resolve,reject) => {
      const request = indexedDB.open('soul-soundtrack',1);
      request.onupgradeneeded = () => request.result.createObjectStore('music');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function read(id) {
    const db = await open();
    return new Promise((resolve,reject) => {
      const request = db.transaction('music').objectStore('music').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function install(file) {
    const buffer = await file.arrayBuffer(), bytes = new Uint8Array(buffer), v = new DataView(buffer);
    const u16 = n => v.getUint16(n,true), u32 = n => v.getUint32(n,true);
    let end = bytes.length-22;
    while(end>=Math.max(0,bytes.length-65557) && u32(end)!==0x06054b50) end--;
    if(end<Math.max(0,bytes.length-65557)) throw Error('Alege arhiva ZIP originală cu cele șapte foldere.');
    let pos=u32(end+16);
    const tracks=new Map();
    for(let i=0;i<u16(end+10);i++){
      if(u32(pos)!==0x02014b50)throw Error('Arhiva ZIP este incompletă.');
      const crc=u32(pos+16), size=u32(pos+24), packed=u32(pos+20), method=u16(pos+10), header=u32(pos+42);
      const t=SOUNDTRACK.find(t=>t.crc===crc && t.size===size);
      if(t && !tracks.has(t.id)){
        if(u32(header)!==0x04034b50)throw Error('Fișier invalid.');
        const start=header+30+u16(header+26)+u16(header+28);
        let blob=new Blob([bytes.subarray(start,start+packed)]);
        if(method===8)blob=await new Response(blob.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
        else if(method!==0)throw Error('Compresia ZIP nu este acceptată.');
        if(blob.size!==size)throw Error('Piesa este incompletă.');
        tracks.set(t.id,blob.slice(0,size,t.src.endsWith('.m4a')?'audio/mp4':'audio/mpeg'));
      }
      pos+=46+u16(pos+28)+u16(pos+30)+u16(pos+32);
    }
    if(tracks.size!==SOUNDTRACK.length)throw Error('Alege Archive.zip cu cele 10 piese originale.');
    const db=await open();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('music','readwrite'), store=tx.objectStore('music');
      tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('Spațiu insuficient pe telefon.'));
      for(const [id,blob] of tracks)store.put(blob,id);
      store.put(true,'installed');
    });
  }
  return {read,install};
})();
