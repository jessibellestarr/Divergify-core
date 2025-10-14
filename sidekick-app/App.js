import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    const t = input.trim();
    if (t) { setTasks(prev => [...prev, t]); setInput(''); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🧠 Divergify Sidekick</Text>
      <Text style={styles.subtitle}>Tiny wins → real momentum</Text>
      <TextInput style={styles.input} placeholder='Type a micro-action…' value={input} onChangeText={setInput}/>
      <Button title='Add' onPress={addTask} />
      <ScrollView style={styles.list}>
        {tasks.map((t,i)=>(<Text key={i} style={styles.task}>• {t}</Text>))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20,backgroundColor:'#f0fff8'},
  title:{fontSize:28,fontWeight:'bold',marginBottom:10,color:'#00aa88'},
  subtitle:{fontSize:16,marginBottom:20},
  input:{borderWidth:1,borderColor:'#ccc',padding:10,marginBottom:10,borderRadius:8},
  list:{marginTop:10},
  task:{fontSize:18,marginVertical:4}
});
