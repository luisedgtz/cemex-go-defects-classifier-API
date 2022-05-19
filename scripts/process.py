import sys
import re
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


defects_string_array = ["Client was not able to see button", "Connection error resulted in crash", "Error while uploading a file", "Button did not appear correctly", "Server side froze due to error"]

defects_keyword_array = get_model_prediction(defects_string_array)


vectorizer = TfidfVectorizer(stop_words="english", ngram_range = (1,3))
X = vectorizer.fit_transform(defects_keyword_array)
true_k = 2
model = KMeans(init = 'k-means++', n_clusters = 2, n_init = 10)
model.fit(X)

yhat = model.predict(X)

res = [{'defect_string': y, 'defect_group': yhat[x]} for x,y in enumerate(defects_string_array)] 


print(res)
