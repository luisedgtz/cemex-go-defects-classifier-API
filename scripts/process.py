import sys
import re
import json
from keybert import KeyBERT

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans, KMeans
from sklearn.metrics import adjusted_rand_score

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

# spawn arguments are sent as strings, they must be parsed first
defects_string_array = json.loads(sys.argv[1])
clusters_number = int(sys.argv[2])

defects_keyword_array = get_model_prediction(defects_string_array)

vectorizer = TfidfVectorizer(stop_words="english", ngram_range = (1,3))
X = vectorizer.fit_transform(defects_keyword_array)
model = KMeans(init = 'k-means++', n_clusters = clusters_number, n_init = 10)
model.fit(X)

groups_array = model.predict(X)

res = [[] for x in range(clusters_number)]

# appendea la string del defecto a la row descrita por index
for index, element in enumerate(defects_string_array):
  res[groups_array[index]].append(element)

print(res)
