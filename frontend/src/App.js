import { useState } from 'react';
import axios from 'axios';
import Card from './Card';
import './App.css';
import { config } from './config'

const API_URL = config.API_URL

function App() {
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState({
    title: '',
    content: '',
    image: null
  })
  console.log(API_URL)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('content', form.content)
    formData.append('image', form.image)

    await axios.post(`${API_URL}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data'}
    })

    const res = await axios.get(`${API_URL}/posts`)
    console.log(res.data)
    setPosts(res.data)
  }

  return (
    <div className="App">
      <h1 className='my-3'>Blog CMS</h1>
      <form className='container border p-3 mt-2' onSubmit={handleSubmit}>
        <input 
          className='form-control mb-3'
          placeholder="title" 
          value={form.title} 
          onChange={(e) => setForm({...form, title: e.target.value})} 
        />
        <textarea
          className='form-control mb-3'
          placeholder='content'
          value={form.content}
          onChange={(e) => setForm({...form, content: e.target.value})}
        />
        <input
          className='form-control mb-3'
          type="file"
          onChange={e => setForm({...form, image: e.target.files[0]})}
        />
        <button type='submit' className='btn btn-success'>Create Post</button>
      </form>

      <Card posts={posts} setPosts={setPosts} />
    </div>
  );
}

export default App;
