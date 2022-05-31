from flask import Flask, request
import re
import json
from keybert import KeyBERT

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans, KMeans
from sklearn.metrics import adjusted_rand_score

#Setup flask server
app = Flask(__name__)

def clean_text(text):
    filtered_text = re.findall(r"[A-Za-z]+", text)
    return filtered_text

def get_model_prediction(arr):
    keyword_array = []

    for element in arr:
        text = clean_text(element)
        joined_text = ' '.join(text)
        kw_model = KeyBERT()
        keywords = kw_model.extract_keywords(joined_text, keyphrase_ngram_range=(1, 5), stop_words=None)
        keyword_array.append(keywords[0][0])

    return keyword_array

def get_defects_description(arr):
  str_arr = [element["description"] for element in arr]
  return str_arr

#Model execution route
@app.route('/classify', methods = ['POST'])
def classify():
    print("running model")
    request_data = request.get_json()['defects_array']
    data = get_defects_description(request_data)
    clusters_number = request.get_json()['cluster_number']
    defects_keyword_array = get_model_prediction(data)
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range = (1,3))
    X = vectorizer.fit_transform(defects_keyword_array)
    model = KMeans(init = 'k-means++', n_clusters = clusters_number, n_init = 10)
    model.fit(X)

    groups_array = model.predict(X)
    res = [[] for x in range(clusters_number)]
    for index, element in enumerate(request_data):
        res[groups_array[index]].append(element)

    print(res)
    return json.dumps(res)

@app.route("/")
def hello():
    return "Hello World!"
