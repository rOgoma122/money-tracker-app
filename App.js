import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdoudabjixvokozilcrr.supabase.co';
const supabaseKey = 'sb_publishable_Tzb5uAKc5kKpwRnVgrf_jw_B2hsnaif';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [jobName, setJobName] = useState('');
  const [wageAmount, setWageAmount] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendCategory, setSpendCategory] = useState('');
  const [balance, setBalance] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBalance();
    fetchMonthSpending();
  }, []);

  async function fetchBalance() {
    try {
      const { data, error } = await supabase.from('balance').select('*').eq('id', 1).single();
      if (error) throw error;
      if (data) setBalance(data.Current_balance ?? data.current_balance ?? 0);
    } catch (e) {
      setErrorMsg('Balance error: ' + e.message);
    }
  }

  async function fetchMonthSpending() {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const { data, error } = await supabase.from('Spending').select('Amount').gte('Date_spent', firstDay);
      if (error) throw error;
      if (data) {
        const total = data.reduce((sum, row) => sum + parseFloat(row.Amount || 0), 0);
        setMonthTotal(total);
      }
    } catch (e) {
      setErrorMsg('Spending error: ' + e.message);
    }
  }

  async function addWage() {
    try {
      if (!jobName || !wageAmount) {
        Alert.alert('Error', 'Please fill job name and amount');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const { error: e1 } = await supabase.from('Wages').insert([{ job_name: jobName, amount: parseFloat(wageAmount), date_paid: today }]);
      if (e1) throw e1;
      const newBalance = balance + parseFloat(wageAmount);
      const { error: e2 } = await supabase.from('balance').update({ Current_balance: newBalance }).eq('id', 1);
      if (e2) throw e2;
      setBalance(newBalance);
      setJobName('');
      setWageAmount('');
      Alert.alert('Success', 'Wage added!');
    } catch (e) {
      Alert.alert('Error adding wage', e.message);
    }
  }

  async function addSpending() {
    try {
      if (!spendAmount) {
        Alert.alert('Error', 'Please enter amount');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const { error: e1 } = await supabase.from('Spending').insert([{ Amount: parseFloat(spendAmount), Category: spendCategory, Date_spent: today }]);
      if (e1) throw e1;
      const newBalance = balance - parseFloat(spendAmount);
      const { error: e2 } = await supabase.from('balance').update({ Current_balance: newBalance }).eq('id', 1);
      if (e2) throw e2;
      setBalance(newBalance);
      setSpendAmount('');
      setSpendCategory('');
      fetchMonthSpending();
      Alert.alert('Success', 'Spending logged!');
    } catch (e) {
      Alert.alert('Error logging spending', e.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Money Tracker</Text>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

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

      <Text style={styles.sect
