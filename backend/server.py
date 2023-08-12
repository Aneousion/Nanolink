import flask
import shortuuid
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask_cors import CORS

app = flask.Flask(__name__)
cors = CORS(app)
mongodb_username, mongodb_password = '',''
mongodb_uri  = ''
# Create a new client and connect to the server
client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
db = client['Url-shortener']
collection = db['Links']
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

@app.route("/")
def hello_world():
    return "Hello World!"    

@app.route('/shorten', methods=['POST'])

def shorten_url():
    long_url = flask.request.json.get('url')
    short_url = shortuuid.uuid()[:6]
    if collection.find_one({'short_url': short_url}):
        short_url = shortuuid.uuid()[:6]
    old_short_url = collection.find_one({'long_url': long_url})
    if old_short_url:
        return flask.jsonify({ 'url': old_short_url['short_url'] })

    urls = {
        'long_url': long_url,
        'short_url': short_url,
    }
    collection.insert_one(urls)
    return flask.jsonify({ 'url': short_url })


@app.route('/<short_url>', methods=['GET'])
def redirect(short_url):
    url = collection.find_one({'short_url': short_url})
    if url:
        if 'https://' in url['long_url']:
            return flask.redirect(url['long_url'])
        return flask.redirect(f"https://{url['long_url']}")
    return 'Page not found', 404

@app.route('/edit', methods=['PUT'])
def edit():
    short_url = flask.request.args.get('url')
    new_short_url = flask.request.json.get('url')
    url = collection.find_one({'short_url': new_short_url})
    if url:
        return flask.jsonify({ 'error': 'This url already exists' })
    long_url = collection.find_one({'short_url': short_url})['long_url']
    new_urls = {
        'long_url': long_url,
        'short_url': new_short_url,
    }
    collection.replace_one({'short_url': short_url}, new_urls)
    return flask.jsonify({ 'message':'success', 'url': new_short_url })


if __name__ == '__main__':
    app.run(debug=True, port=5000)