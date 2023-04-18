from keybert import KeyBERT
from keyphrase_vectorizers import KeyphraseCountVectorizer
import spacy
import pandas as pd

nlp = spacy.load('en_core_web_md')

def keyword_extraction(text):
    kw_model = KeyBERT()
    # KeyphraseCountVectorizer parameter: pos_pattern='<N.*>'
    keyphrasevectorizer = KeyphraseCountVectorizer()
    try:
        keywords_KPCV = kw_model.extract_keywords(text,
                                                vectorizer=keyphrasevectorizer, # type: ignore
                                                use_mmr=True)
    except:
        return []
    threshold = 0.2
    keywords = []
    for candidate in keywords_KPCV:
        if candidate[1] >= threshold: # type: ignore
            keywords.append(candidate)
    # keywords = [candidate[0] for candidate in keywords_KPCV] 
    return keywords

def split_keywords(keywords):
    for i, item in enumerate(keywords):
        if ' ' in item:
            keywords[i] = item.split()
    return keywords


def keywords_relevance(speech_keywords, lyrics_keywords):
    def weight(keywords_text, keywords_weight, weight_total, word):
        weight = 0
        for i, keyword in enumerate(keywords_text):
            if word == keyword:
                weight = keywords_weight[i] / sum(keywords_weight)
        return weight
    keyword_pairs = []
    overall_similarity = 0

    global nlp
    speech_keywords_text = [candidate[0] for candidate in speech_keywords]
    # print(f"speech keywords: {speech_keywords_text}")
    # speech_keywords_weight = [candidate[1] for candidate in speech_keywords]
    lyrics_keywords_text = [candidate[0] for candidate in lyrics_keywords]
    # print(f"lyrics keywords: {lyrics_keywords_text}")
    lyrics_keywords_weight = [candidate[1] for candidate in lyrics_keywords]

    for keyword_l in lyrics_keywords_text:
        token1 = nlp(keyword_l)
        keyword_similarity_with_sentence = []
        for keyword_s in speech_keywords_text:
            token2 = nlp(keyword_s)
            w2wsimilarity = token1.similarity(token2)
            # print(f"Similarity of {token1.text} and {token2.text}:", w2wsimilarity)
            pair = {"lyrics_word": token1.text,
                    "speech_word": token2.text,
                    "similarity": w2wsimilarity}
            keyword_pairs.append(pair)
            keyword_similarity_with_sentence.append(w2wsimilarity)
        # print(f"relevance of {token1.text} = {max(keyword_similarity_with_sentence)}. weight of this word = {weight(lyrics_keywords_text, lyrics_keywords_weight, sum(lyrics_keywords_weight), token1.text)}")
        if (len(keyword_similarity_with_sentence) > 0):
            overall_similarity += max(keyword_similarity_with_sentence) * weight(lyrics_keywords_text, lyrics_keywords_weight, sum(lyrics_keywords_weight), token1.text)
    # print("Overall similarity:",overall_similarity)
    return overall_similarity, keyword_pairs
