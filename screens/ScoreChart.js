import React, { useEffect, useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { API_BASE_URL } from '../utils/config';

export default function ScoreChart({ range = 'all', smooth = true }) {
  const [chartData, setChartData] = useState(null);

  const toDate = ts => {
    const d = new Date(ts.replace(' ', 'T'));
    return isNaN(d) ? null : d;
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      const res  = await fetch(`${API_BASE_URL}/api/score-history`, { credentials: 'include' });
      const { scores = [] } = await res.json();
      const raw = scores.filter(v => Number.isFinite(v.score));
      if (!raw.length || ignore) return;

      const sorted = raw.slice().sort((a,b)=>toDate(a.timestamp)-toDate(b.timestamp));

      /* range filter */
      let data = sorted;
      const now = new Date();
      if (range==='week') {
        const wk = new Date(now); wk.setDate(now.getDate()-7);
        data = sorted.filter(v => toDate(v.timestamp) >= wk);
      } else if (range==='month') {
        const mo = new Date(now); mo.setMonth(now.getMonth()-1);
        data = sorted.filter(v => toDate(v.timestamp) >= mo);
      }
      if (!data.length) { setChartData(null); return; }

      const labels = data.map(v=>{
        const d=toDate(v.timestamp);
        return `${d.getMonth()+1}/${d.getDate()}`;
      });
      const mainSeries = data.map(v=>v.score);

      const baseline = sorted.length>=5
        ? Math.round(sorted.slice(0,5).reduce((s,v)=>s+v.score,0)/5)
        : null;
      const baseSeries = baseline ? data.map(()=>baseline) : null;

      const fallbackSeries = data.map(v=>v.is_fallback?v.score:NaN);
      const hasFallback   = fallbackSeries.some(v=>!isNaN(v));

      /* datasets & legend 同期 */
      const datasets = [
        { data: mainSeries, strokeWidth:2, color:()=> 'rgba(75,192,192,1)' }
      ];
      const legendArr = ['ストレススコア'];

      if (baseSeries) {
        datasets.push({
          data: baseSeries, strokeWidth:1,
          color:()=> 'rgba(255,99,132,0.7)', withDots:false
        });
        legendArr.push('ベースライン');
      }
      if (hasFallback) {
        datasets.push({
          data: fallbackSeries, strokeWidth:0,
          color:()=> 'rgba(255,165,0,0.9)', withDots:true
        });
        legendArr.push('仮スコア');
      }

      setChartData({ labels, datasets, legend: legendArr });
    })();
    return ()=>{ ignore=true; };
  }, [range]);

  if (!chartData) {
    return <Text style={{ textAlign:'center', marginTop:20 }}>📉 データがありません</Text>;
  }

  return (
    <View>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width-40}
        height={240}
        fromZero bezier={smooth} segments={5}
        yAxisSuffix="点"
        chartConfig={{
          backgroundGradientFrom:'#fff', backgroundGradientTo:'#fff',
          decimalPlaces:0,
          color:o=>`rgba(0,0,0,${o})`,
          labelColor:o=>`rgba(0,0,0,${o})`,
          propsForDots:{ r:'3', strokeWidth:'1', stroke:'#555' },
          propsForLabels:{ rotation:'-30', fontSize:10 },
        }}
        style={{ marginVertical:8, borderRadius:8 }}
      />

      {/* 凡例テキスト */}
      <View style={{ marginTop:16, paddingHorizontal:20 }}>
        <Text style={{ fontWeight:'bold', fontSize:14, marginBottom:6 }}>【スコアの目安】</Text>
        {[
          { emoji:'🟢', label:'95',     desc:'非常にリラックス' },
          { emoji:'😊', label:'70-90', desc:'安定しています'  },
          { emoji:'😟', label:'50-69', desc:'やや不安定'    },
          { emoji:'🔴', label:'〜49',  desc:'ストレスが高いかも'},
        ].map((row,i)=>(
          <View key={i} style={{ flexDirection:'row', marginBottom:4 }}>
            <Text style={{ width:80 }}>{row.emoji} {row.label}</Text>
            <Text>{row.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
