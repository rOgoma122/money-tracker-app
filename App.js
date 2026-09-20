import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdoudabjixvokozilcrr.supabase.co';
const supabaseKey = 'PASTE_YOUR_PUBLISHABLE_KEY_HERE';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [jobName, setJobName] = useState('');
  const [wageAmount, setWageAmount] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendCategory, setSpendCategory] = useState('');
  const [balance, setBalance] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);

  useEffect(() => {
    fetchBalance();
    fetchMonthSpending();
  }, []);

  async function fetchBalance() {
    const { data } = await supabase.from('balance').select('*').eq('id', 1).single();
    if (data) setBalance(data.Current_balance || data.current_balance);
  }

  async function fetchMonthSpending() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const { data } = await supabase.from('Spending').select('Amount').gte('date_spent', firstDay);
    if (data) {
      const total = data.reduce((sum, row) => sum + parseFloat(row.Amount || 0), 0);
      setMonthTotal(total);
    }
  }

  async function addWage() {
    if (!jobName || !wageAmount) {
      Alert.alert('Error', 'Please fill job name and amount');
      return;
    }
    await supabase.from('Wages').insert([{ job_name: jobName, amount: parseFloat(wageAmount) }]);
    const newBalance = balance + parseFloat(wageAmount);
    await supabase.from('balance').update({ Current_balance: newBalance }).eq('id', 1);
    setBalance(newBalance);
    setJobName('');
    setWageAmount('');
    Alert.alert('Success', 'Wage added!');
  }

  async function addSpending() {
    if (!spendAmount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }
    await supabase.from('Spending').insert([{ Amount: parseFloat(spendAmount), Category: spendCategory }]);
    const newBalance = balance - parseFloat(spendAmount);
    await supabase.from('balance').update({ Current_balance: newBalance }).eq('id', 1);
    setBalance(newBalance);
    setSpendAmount('');
    setSpendCategory('');
    fetchMonthSpending();
    Alert.alert('Success', 'Spending logged!');
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Money Tracker</Text>

      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>₹{balance.toFixed(2)}</Text>
      </View>

      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>Spent This Month</Text>
        <Text style={styles.balanceValue}>₹{monthTotal.toFixed(2)}</Text>
      </View>

      <Text style={styles.section}>Add Wage</Text>
      <TextInput style={styles.input} placeholder="Job Name" value={jobName} onChangeText={setJobName} />
      <TextInput style={styles.input} placeholder="Amount" value={wageAmount} onChangeText={setWageAmount} keyboardType="numeric" />
      <TouchableOpacity style={styles.button} onPress={addWage}>
        <Text style={styles.buttonText}>Add Wage</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Log Spending</Text>
      <TextInput style={styles.input} placeholder="Amount" value={spendAmount} onChangeText={setSpendAmount} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Category" value={spendCategory} onChangeText={setSpendCategory} />
      <TouchableOpacity style={[styles.button, styles.spendButton]} onPress={addSpending}>
        <Text style={styles.buttonText}>Log Spending</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  balanceBox: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 15 },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceValue: { fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 },
  button: { backgroundColor: '#22c55e', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  spendButton: { backgroundColor: '#ef4444' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
