import { useState } from 'react'

function App() {
  const [form, setForm] = useState({ LB: '', LT: '', KT: '', KM: '', GRS: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const values = Object.values(form)
    if (values.some((v) => v === '' || isNaN(v))) {
      setResult('Mohon isi semua field dengan angka valid')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.predicted_price) {
        setResult(`Prediksi harga: Rp ${Number(data.predicted_price).toLocaleString()}`)
      } else {
        setResult(`Error: ${data.error}`)
      }
    } catch (err) {
      setResult('Gagal terhubung ke server Flask (cek apakah backend jalan di port 5000)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-7 text-center">PREDIKSI HARGA RUMAH</h2>
        <div className="space-y-4">
          <input name="LB" type="number" min="0" placeholder="Luas bangunan (LB)" value={form.LB} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
          <input name="LT" type="number" min="0" placeholder="Luas tanah (LT)" value={form.LT} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
          <input name="KT" type="number" min="0" placeholder="Jumlah kamar tidur (KT)" value={form.KT} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
          <input name="KM" type="number" min="0" placeholder="Jumlah kamar mandi (KM)" value={form.KM} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
          <input name="GRS" type="number" min="0" max="2" placeholder="Garasi (0/1/2)" value={form.GRS} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />

          <button onClick={handleSubmit} disabled={loading} className={`w-full py-2 rounded-lg text-white font-semibold transition ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Loading...' : 'Prediksi Harga'}
          </button>

          {result && <p className="text-center text-lg font-semibold mt-4 text-blue-500">{result}</p>}
        </div>
      </div>
    </div>
  )
}

export default App
