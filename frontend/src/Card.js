import axios from 'axios'
import { useState } from 'react'

const Card = ({ posts, setPosts }) => {
  const [message, setMessage] = useState("")

  const handleDelete = async (id) => {
    try{
      const resp = await axios.delete(`http://localhost:5000/posts/${id}`)
      console.log(resp.data)
      setMessage(resp.data.message)
      setPosts(post => post.filter(p => p._id !== id))
    } catch(err) {
      console.error(err.message)
    }
  }



  return (
    <div className="grid grid-template-3">
    {message ? <p>{message}</p> : null}
    {posts.map(post => (
        <div className="card" style={{width: '18rem'}} key={post._id}>
          <img src={post.imageUrl} className="card-img-top" alt="..." />
          <div className="card-body">
            <h5 className="card-title">{post.tile}</h5>
            <p className="card-text">{post.content}</p>
            <a type='button' className="btn btn-primary">Read Story</a>
            <a type='button' onClick={() => handleDelete(post._id)} className="btn btn-danger">Delete Story</a>
          </div>
        </div>
    ))}
    </div>
  )
}

export default Card