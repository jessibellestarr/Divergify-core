import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, FlatList, Keyboard, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

// Keys
const K_TASKS = 'divergify:tasks';
const K_TINFOIL = 'divergify:tinfoil';
const K_LAST_BG = 'divergify:last_bg_time';

export default function App(){
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [tinFoil, setTinFoil] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pulse = useSharedValue(1);
  const appState = useRef(AppState.currentState);

  // Load settings/tasks
  useEffect(()=>{
    let active = true;
    (async()=>{
      try {
        const [t, tf] = await Promise.all([
          AsyncStorage.getItem(K_TASKS),
          AsyncStorage.getItem(K_TINFOIL)
        ]);
        if(!active) return;
        if(t) setTasks(JSON.parse(t));
        if(tf) setTinFoil(tf==='1');
      } finally {
        if(active) setHydrated(true);
      }
    })();
    return ()=>{ active = false; };
  },[]);

  // Persist tasks/settings unless Tin Foil is ON
  useEffect(()=>{
    if(hydrated && !tinFoil){
      AsyncStorage.setItem(K_TASKS, JSON.stringify(tasks));
    }
  },[tasks, tinFoil, hydrated]);
  useEffect(()=>{
    if(hydrated){
      AsyncStorage.setItem(K_TINFOIL, tinFoil?'1':'0');
    }
  },[tinFoil, hydrated]);

  // Task add
  const addTask = () => {
    const t = input.trim();
    if(!t) return; setTasks(prev=>[...prev, t]); setInput('');
    reward();
  };

  // Dopamine reward: quick haptic + header pulse
  const reward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulse.value = withSequence(withTiming(1.15,{duration:140}), withTiming(1,{duration:160}));
  };

  // Simple anti-context-switch nudge: if app backgrounded < 20s and returns, show prompt
  useEffect(()=>{
    const sub = AppState.addEventListener('change', async (next)=>{
      const now = Date.now();
      if(appState.current === 'active' && next.match(/inactive|background/)){
        await AsyncStorage.setItem(K_LAST_BG, String(now));
      }
      if(next === 'active'){
        const last = Number(await AsyncStorage.getItem(K_LAST_BG)||0);
        if(last && now - last < 20000){ // 20s
          setNudge('Did you just switch? Want to resume your last task?');
        }
      }
      appState.current = next;
    });
    return ()=>sub.remove();
  },[]);

  const toggleTinFoil = () => setTinFoil(v=>!v);
  const removeTask = (i:number) => setTasks(prev=>prev.filter((_,idx)=>idx!==i));

  const Header = () => (
    <View style={s.header}>
      <Text style={s.h1}>🧠 Divergify Sidekick</Text>
      <Text style={s.sub}>For brains that zig when the world zags</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={Platform.OS==='ios'?'light-content':'default'} />
      <Header/>

      {nudge && (
        <Pressable style={s.nudge} onPress={()=>setNudge(null)}>
          <Text style={s.nudgeText}>{nudge}</Text>
        </Pressable>
      )}

      <View style={s.row}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a task…"
          onSubmitEditing={addTask}
          style={s.input}
          returnKeyType="done"
        />
        <Pressable onPress={addTask} style={s.btn}><Text style={s.btnTxt}>Add</Text></Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t,i)=>t+':'+i}
        contentContainerStyle={{paddingBottom:40}}
        renderItem={({item,index})=> (
          <Pressable onLongPress={()=>removeTask(index)} style={s.task}>
            <Text style={s.bullet}>•</Text>
            <Text style={s.taskTxt}>{item}</Text>
          </Pressable>
        )}
      />

      <View style={s.footer}>
        <Pressable onPress={toggleTinFoil} style={[s.toggle, tinFoil && s.toggleOn]}>
          <Text style={s.toggleTxt}>Tin Foil Hat Mode: {tinFoil?'ON':'OFF'}</Text>
        </Pressable>
        <View style={s.links}>
          <Pressable style={s.link} onPress={()=>{ /* open Ko-fi */ }}><Text style={s.linkTxt}>Ko-fi</Text></Pressable>
          <Pressable style={s.link} onPress={()=>{ /* open Printful */ }}><Text style={s.linkTxt}>Merch</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#0B0F12', padding:16 },
  header:{ alignItems:'center', marginBottom:8 },
  h1:{ color:'#E5E7EB', fontSize:22, fontWeight:'700' },
  sub:{ color:'#A7ABB3', marginTop:4 },
  row:{ flexDirection:'row', gap:8, alignItems:'center', marginVertical:12 },
  input:{ flex:1, backgroundColor:'rgba(255,255,255,0.06)', color:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.15)' },
  btn:{ backgroundColor:'#16f2a6', paddingHorizontal:18, paddingVertical:12, borderRadius:12 },
  btnTxt:{ fontWeight:'700' },
  task:{ flexDirection:'row', alignItems:'center', gap:10, padding:12, borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.12)', marginBottom:8 },
  bullet:{ color:'#16f2a6', fontSize:18, marginTop:-2 },
  taskTxt:{ color:'#E5E7EB', flexShrink:1 },
  footer:{ gap:10, marginTop:8 },
  toggle:{ padding:12, borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.25)', alignItems:'center' },
  toggleOn:{ backgroundColor:'rgba(22,242,166,0.1)', borderColor:'#16f2a6' },
  toggleTxt:{ color:'#E5E7EB', fontWeight:'600' },
  links:{ flexDirection:'row', justifyContent:'center', gap:12 },
  link:{ paddingVertical:8, paddingHorizontal:12, borderRadius:999, borderWidth:1, borderColor:'rgba(255,255,255,0.25)' },
  linkTxt:{ color:'#E5E7EB' },
  nudge:{ padding:10, backgroundColor:'rgba(255,255,255,0.08)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.15)', marginBottom:6 },
  nudgeText:{ color:'#E5E7EB', textAlign:'center' }
});
