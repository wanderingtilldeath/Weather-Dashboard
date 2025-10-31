import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

export default function ForecastChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#666' }}>No forecast data available.</p>;
  }

  return (
    <div style={{ marginTop: '15px' }}>
      <h4>7-Day Temperature Forecast</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: '°', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="min" name="Min Temp" />
          <Line type="monotone" dataKey="max" name="Max Temp" />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={200}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis label={{ value: 'Wind (km/h)', angle: -90, position: 'insideLeft' }} />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="wind" name="Wind Speed" stroke="blue" />
  </LineChart>
</ResponsiveContainer>
    </div>
  );
}
