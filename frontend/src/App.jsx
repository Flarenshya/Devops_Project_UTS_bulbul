import { useState, useRef } from 'react'

function App() {
  const [form, setForm] = useState({ LB: '', LT: '', KT: '', KM: '', GRS: '0' })
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const resultRef = useRef(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const values = Object.values(form)
    if (values.some((v) => v === '' || isNaN(v))) {
      alert('Mohon isi semua field dengan angka valid')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.predicted_price) {
        const price = Number(data.predicted_price)
        const newResult = {
          price: price,
          formatted: `Rp ${price.toLocaleString()}`,
          level: price < 500000000 ? 'Terjangkau' : price < 1500000000 ? 'Menengah' : 'Mewah',
          color: price < 500000000 ? 'bg-green-400' : price < 1500000000 ? 'bg-yellow-400' : 'bg-red-400',
          width: price < 500000000 ? '30%' : price < 1500000000 ? '60%' : '100%'
        }

        setResult(newResult)
        setHistory(prev => [newResult, ...prev].slice(0, 3))
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert('Gagal terhubung ke server Backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full glass-nav z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tighter">HousePrice</h1>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition">Home</a>
          <a href="#predict" className="hover:text-white transition">Prediction</a>
          <a href="#features" className="hover:text-white transition">Features</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center flex-grow w-full">

        {/* Left: Content */}
        <div className="space-y-8 text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent">
            Temukan Harga <br /> Rumah Impian.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto lg:mx-0">
            Gunakan kekuatan AI untuk memprediksi harga properti secara akurat berdasarkan spesifikasi bangunan. Cepat, mudah, dan gratis.
          </p>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">RIWAYAT PREDIKSI BARU-BARU INI</h3>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white">{h.formatted}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${h.color} text-black font-bold`}>{h.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Form Card */}
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden ring-1 ring-white/20 shadow-2xl">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Mulai Prediksi
          </h2>

          <div className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Luas Bangunan</label>
                <input name="LB" type="number" placeholder="0 m²" value={form.LB} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Luas Tanah</label>
                <input name="LT" type="number" placeholder="0 m²" value={form.LT} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Kamar Tidur</label>
                <input name="KT" type="number" placeholder="0" value={form.KT} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Kamar Mandi</label>
                <input name="KM" type="number" placeholder="0" value={form.KM} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Garasi</label>
                <select name="GRS" value={form.GRS} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition appearance-none">
                  <option value="0" className="bg-gray-900">0</option>
                  <option value="1" className="bg-gray-900">1</option>
                  <option value="2" className="bg-gray-900">2</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setForm({ LB: '', LT: '', KT: '', KM: '', GRS: '0' }); setResult(null); }} className="w-1/3 bg-transparent border border-white/20 text-white font-semibold py-4 rounded-xl hover:bg-white/10 transition">
                Reset
              </button>
              <button onClick={handleSubmit} disabled={loading} className="w-2/3 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="spinner border-black border-t-transparent"></span> : 'Hitung Estimasi'}
              </button>
            </div>

            {/* Result Area */}
            {result && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                <p className="text-gray-400 text-sm mb-1">Estimasi Harga Pasar</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-500">
                  {result.formatted}
                </p>
                <div className="price-meter-container">
                  <div className={`price-meter-fill ${result.color}`} style={{ width: result.width }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Ekonomis</span>
                  <span>Mewah</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm mt-auto">
        <p>&copy; 2026 HousePrice Project. Powered by Advanced Machine Learning.</p>
      </footer>
    </div>
  )
}

export default App
