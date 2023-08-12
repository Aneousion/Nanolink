import { useState } from 'react'
import axios from 'axios';
import { Button, Form, InputGroup, Spinner, Card } from 'react-bootstrap';


function App() {
    const [longurl, setLongurl] = useState('')
    const [shorturl, setShorturl] = useState('')
    const [newshorturl, setNewShorturl] = useState('')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false);
    const [editMode, setEditMode] = useState(false)
    const domain = '' //the flask backend endpoint
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText("https://" + domain + '/' + shorturl);
            setCopied(true);
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    };
    const getShortUrl = () => {
        if (!/^(ftp|http|https):\/\/[^ "]+\.[^ "]+$/.test(longurl)) {
            setError('Enter a valid url');
            setTimeout(() => { setError('') }, 1000)
            return;
        }
        document.getElementsByClassName('spinner')[0].classList.remove('hidden')
        axios.post(`https://${domain}/shorten`, { 'url': longurl }).then((response) => {
            if (response.data.error) {
                document.getElementsByClassName('spinner')[0].classList.add('hidden')
                setError(response.data.error);
                setTimeout(() => { setError('') }, 1000)
                return;
            }
            setShorturl(response.data.url)
            document.getElementsByClassName('spinner')[0].classList.add('hidden')
        })
    }
    const editShortUrl = () => {
        if (!newshorturl.trim()) {
            setError('Enter a valid url');
            setTimeout(() => { setError('') }, 1000)
            return;
        }
        document.getElementsByClassName('spinner')[0].classList.remove('hidden')
        axios.put(`https://${domain}/edit?url=${shorturl}`, { 'url': newshorturl }).then((response) => {
            if (response.data.error) {
                document.getElementsByClassName('spinner')[0].classList.add('hidden')
                setError(response.data.error);
                setTimeout(() => { setError('') }, 1000)
                return;
            }
            setCopied(false)
            setShorturl(response.data.url)
            setEditMode(false)
            setNewShorturl('')
            document.getElementsByClassName('spinner')[0].classList.add('hidden')
        })
    }

    return (
        <>
            {editMode ? <div>

                <InputGroup className="" >
                    <InputGroup.Text id="basic-addon3" >
                        https://{domain}/
                    </InputGroup.Text>
                    <Form.Control id="basic-url" aria-describedby="basic-addon3" value={newshorturl} placeholder={shorturl} onChange={(event) => setNewShorturl(event.target.value)} />
                    <Button id='button-addon1' onClick={() => editShortUrl()}><Spinner
                        className='spinner hidden'
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />edit</Button>
                </InputGroup>
                {error && <p className='error'>{error}</p>}
            </div> : <div>
                {shorturl ? <div className="copy-text">
                    <InputGroup className='mb-3'><Form.Control className="text" value={"https://" + domain + '/' + shorturl} readOnly />
                    {copied ? <Button variant='primary' disabled>Copied!</Button> : <Button variant='primary' onClick={() => copyToClipboard()}><i className="fa fa-clone"></i></Button>}
                    <Button onClick={() => setEditMode(true)}>Create custom url</Button></InputGroup>
                </div> : <div>

                    <InputGroup className="">
                        <Form.Control
                            placeholder="Enter long url"
                            aria-label="Enter long url"
                            aria-describedby="basic-addon2"
                            onChange={(event) => setLongurl(event.target.value)}
                            value={longurl}
                            
                        />
                        <Button onClick={() => getShortUrl()} variant='primary' size="sm" id="button-addon2">
                            <Spinner
                                className='spinner hidden'
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            Shorten
                        </Button>
                    </InputGroup>


                    {error && <p className='error'>{error}</p>}
                </div>
                }
            </div>}
            <Card className='text-center'>
                
                <Card.Body>
                    <Card.Title>Created by Aneousion</Card.Title>
                    <Card.Text>
                        View source code and contact me on Github
                    </Card.Text>
                    <a href='https://github.com/aneousion'><Button variant="primary">Github</Button></a>
                </Card.Body>
            </Card>
        </>
    )
}

export default App;
