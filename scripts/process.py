import sys
import re
from keybert import KeyBERT

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans, KMeans
from sklearn.metrics import adjusted_rand_score

def clean_text(text):
  filtered_text = re.findall(r"[A-Za-z]+", text)
  return filtered_text

doc = """
SAP Delivery Number: 227951632
Customer: 50212224
Jobsite: 70143186
Driver: V1.8.8.17
Track App: Android v3.14.4.4, iOS v2.30.20

Jobsite has paperless flagged not ticked. 

Pre-ePOD showing as HTC ticket once added to driver app. Showing on all platforms.

Once ticket has been completed in Driver App, the ePOD reverts back to the Driver ePOD, not HTC. This is then the same in all platforms. 

Steps: 
1. Add delivery number to driver app 227951632
2. Info-->View Delivery Ticket, HTC ticket showing correctly
3. To Jobsite-->Complete times for Onsite, Unload Start, Unload End
4. Complete fields in Extras
5. Complete fields in Driver notes
6. Add signee and complete all fields and submit
7. Next--> Details and Notes-->Add customer notes
8. Send without signature
9. History--> info-->View Delivery Ticket
10. Driver epod visible, not HTC document
11. Driver epod visible in all consoles, not HTC
12. Signature signed in Android track app
13. Still driver app epod visible in all consoles (with signature)

Actual Behaviour: No HTC ticket once driver app is completed

Expected Behaviour: HTC ticket should be available in all consoles and driver app  once completed [^Pre-epod.PDF]  [^Signed epod.pdf] 
 """

text = clean_text(doc)
##print(text)


joined_text =  ' '.join(text)

kw_model = KeyBERT()
keywords = kw_model.extract_keywords(joined_text, keyphrase_ngram_range=(1, 5), stop_words=None)


##print(keywords[0])

dummy_data = ["Client was not able to see button", "Connection error resulted in crash", "Error while uploading a file", "Button did not appear correctly", "Server side froze due to error"]
vectorizer = TfidfVectorizer(stop_words="english", ngram_range = (1,3))
X = vectorizer.fit_transform(dummy_data)
true_k = 2
model = KMeans(init = 'k-means++', n_clusters = 2, n_init = 10)
model.fit(X)

yhat = model.predict(X)

print(yhat)

##print('First param:'+sys.argv[1]+'#')