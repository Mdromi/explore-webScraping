# python3 crawler.py

import logging
import requests
import re
import sys
import csv
from html import unescape


def get_category_list(content):
    """get_category_list takes content of home page and returns a list of categories and their urls"""
    return category_pat.findall(content)
    

def get_blog_details(content):
    """get_blog_details takes content of blog page, press the page and returns details about a blog"""

    base_url = 'https://www.freecodecamp.org'

    result = img_pat.findall(content)
    if len(result) == 0:
        logging.warn('Image url not found!')
        image_url = ''
    else:
        image_url = result[0]
        image_url = image_url.split(',')[0].strip().split()[0]

    result = tag_pat.findall(content)
    if len(result) == 0:
        logging.warn('Tag url not found!')
        tag = ''
        tag_url = ''
    else:
        tag_url = result[0]
        tag_url = (tag_url[0], tag_url[1].strip().replace('#', ''))
        tag = tag_url[1]
        tag_url = tag_url[0]
        tag_url = base_url + tag_url

    result = title_pat.findall(content)
    if len(result) == 0:
        logging.warn('Title not found!')
        title = ''
        title_url = ''
    else:
        value = result[0]
        title_url = base_url + value[0]
        title = value[1]

    result = author_pat.findall(content)
    if len(result) == 0:
        logging.warn('Author not found!')
        author_name = ''
        author_url = ''
    else:
        value = result[0]
        author_url = base_url + value[0]
        author_name = value[1]
    
    result = date_pat.findall(content)
    if len(result) == 0:
        logging.warn('Date not found!')
        post_date = ''
    else:
        post_date = result[0]

    return title, title_url, image_url, tag, tag_url, author_name, author_url, post_date

def get_page_content(url):
    """get_page_content takes a url and return the content of the page"""
    try:
        response = requests.get(url)
    except requests.exceptions.RequestException as e:
        logging.error(e)
    
    if response.ok:
        return response.text
    
    logging.error('Can not get content from URL:' + url)
    return ''

def get_next_page(url, content):
    """checks the content of the book list page and return link of the next page, return None, if there is no more next page"""
    result = next_page_pat.findall(content)
    if len(result) == 0:
        return False
    return True

def crawl_category(category_name, category_url):
    """crawl a particular category of books"""
    content = get_page_content(category_url)
    # content = content.replace('\n', ' ')
    title, title_url, image_url, tag, tag_url, author_name, author_url, post_date = get_blog_details(content)

    while True:
        content = get_page_content(category_url)
        next_page = get_next_page(category_url, content)


def crawl_website():
    """crawl_website() is the main function that coordinates the whole crawling task"""
    url = 'https://www.freecodecamp.org/news/tag/'
    host_name = 'https://www.freecodecamp.org'

    content = get_page_content(url+'/blog')
    content = content.replace('\n', ' ')


    if content == '':
        logging.critical('Failed to get content from ' + url)
        sys.exit(1)

    category_list = get_category_list(content)

    for category in category_list:
        category_url, category_name, category_posts = category 
        category_url = host_name +  category_url
        crawl_category(category_name, category_url)

if __name__ == '__main__':
    # Compile different regular expression patterns
    category_pat = re.compile(r'<a class=\'tag\' href="([^"]+)">\s*<h3 dir="ltr">(?:#)?(.*?)\s*<small>\s*\|\s*(\d+)\s*</small>', re.DOTALL)
    img_pat = re.compile(r'<img[^>]*\s+srcset="([^"]+)"[^>]*>')
    tag_pat = re.compile(r'<span\s+class="post-card-tags">.*?<a\s+dir="ltr"\s+href="([^"]+)">([^<]+)</a>.*?</span>')
    title_pat = re.compile(r'<a\s+href="([^"]+)">\s*([^<]+)\s*</a>')
    # post_pat = re.compile(r'<a\s+class="post-card-image-link"\s+href="([^"]*)"\s+aria-label=".*?">')
    author_pat = re.compile(r'<a\s+class="meta-item"\s+href="([^"]+)".*?>(.*?)</a>')
    date_pat = re.compile(r'<time[^>]*\s+datetime="([^"]+)\s+\(Coordinated Universal Time\)"[^>]*>')
    next_page_pat = re.compile(r'<button id="readMoreBtn" data-test-label="load-more-articles-button">(.*?)</button>')

    logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', filename='blog_crawler.log', level=logging.DEBUG)

    crawl_website()


    