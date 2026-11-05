// Short instrumental scores bundled with Soul. Each row defines its own tempo,
// chord roots and melody in semitones, relative to the tonic.
const soulScores = [
  ['stressed','Mal liniștit',50,54,[0,5,2,0],[7,null,4,2,0,null,2,null]],
  ['sad','Lumină în ploaie',55,57,[0,3,5,7],[0,3,7,null,5,3,2,null]],
  ['angry','După furtună',58,50,[0,5,7,0],[12,7,null,5,3,null,0,null]],
  ['joy','Soare pe apă',88,60,[0,5,7,0],[4,7,9,7,12,null,9,7]],
  ['focus','Pași egali',76,52,[0,2,5,2],[0,7,12,7,2,7,12,7]],
  ['anxious','Respiră încet',52,55,[0,5,0,7],[7,null,5,null,2,null,0,null]],
  ['meditation','Grădina de seară',45,48,[0,0,5,0],[12,null,null,7,null,14,null,null]]
];
const demos = soulScores.map(([category,title,bpm])=>({
  id:'demo-'+category, kind:'recording', category, title, demo:true,
  duration:Math.ceil(32*60/bpm+3)
}));
let cachedDemo;
function demoAudio(track) {
  if(cachedDemo?.id===track.id)return cachedDemo.blob;
  const [, ,tempo,tonic,roots,melody]=soulScores.find(row=>row[0]===track.category);
  const rate=16000, beat=60/tempo;
  const mix=new Float32Array(rate*track.duration);
  function note(start,length,pitch,level,bell){
    const offset=Math.floor(start*rate);
    const frames=Math.min(Math.floor(length*rate),mix.length-offset);
    const step=2*Math.PI*440*Math.pow(2,(pitch-69)/12)/rate;
    for(let i=0;i<frames;i++){
      const t=i/rate;
      const envelope=Math.min(1,t/(bell?.024:.35))*Math.min(1,(frames-i)/(rate*(bell?.65:.7)));
      const tone=Math.sin(step*i)+.19*Math.sin(step*i*2)+.07*Math.sin(step*i*3);
      mix[offset+i]+=level*envelope*(bell?Math.exp(-1.7*t):.78+.12*Math.cos(t))*tone;
    }
  }
  for(let bar=0;bar<8;bar++){
    const root=tonic+roots[bar%4], start=bar*4*beat;
    note(start,4*beat,root-12,.105,false);
    note(start+.08,4*beat,root+7,.07,false);
    for(let n=0;n<4;n++){
      const interval=melody[(bar*4+n)%8];
      if(interval!=null)note(start+n*beat,Math.min(2.7,2.4*beat),tonic+12+interval,.24,true);
    }
  }
  const bytes=new ArrayBuffer(44+mix.length*2), v=new DataView(bytes);
  function tag(at,text){for(let i=0;i<text.length;i++)v.setUint8(at+i,text.charCodeAt(i));}
  tag(0,'RIFF');v.setUint32(4,bytes.byteLength-8,true);tag(8,'WAVE');tag(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);
  v.setUint16(34,16,true);tag(36,'data');v.setUint32(40,mix.length*2,true);
  for(let i=0;i<mix.length;i++)v.setInt16(44+i*2,Math.tanh(mix[i]*1.7)*30000,true);
  const blob=new Blob([bytes],{type:'audio/wav'});cachedDemo={id:track.id,blob};return blob;
}
