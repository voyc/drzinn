#!/usr/bin/python2.4

import httplib, urllib, sys

if (len(sys.argv) < 3):
	print "two parameters required"
	sys.exit()

url = 'http://drzinn.voyc.com/'
if (sys.argv[1] == "dev"):
	url = 'http://drzinn.hagstrand.com/'
 
arr = [
	('code_url', url + 'js/namespace.js'),
	('code_url', url + 'js/account.js'),
	('code_url', url + 'js/accountview.js'),
	('code_url', url + 'js/user.js'),
	('code_url', url + 'js/drzinn.js'),
	('code_url', url + 'js/drzinnview.js'),
	('code_url', url + 'js/pie.js'),
	('code_url', url + 'js/gauge.js'),
	('code_url', url + 'js/scores.js'),
	('code_url', url + 'minimal/minimal.js'),
	('code_url', url + 'icon/icon.js'),
	('code_url', url + 'icon/lib/menu.js'),
	('code_url', url + 'icon/lib/gear.js'),
	('code_url', url + 'icon/lib/user.js'),
	('code_url', url + 'icon/lib/spinner.js'),
	('code_url', url + 'jslib/utils.js'),
	('code_url', url + 'jslib/dragger.js'),
	('code_url', url + 'jslib/comm.js'),
	('code_url', url + 'jslib/observer.js'),
	('code_url', url + 'jslib/note.js'),
	('code_url', url + 'jslib/session.js'),
	('code_url', url + 'jslib/cookie.js'),
	('code_url', url + 'jslib/browserhistory.js'),
	('code_url', url + 'js/data/strings.js'),
	('code_url', url + 'js/data/tests.js'),
	('code_url', url + 'js/data/factors.js'),
	('code_url', url + 'js/data/gifts.js'),
	('code_url', url + 'js/data/quizz/temperament.js'),
	('code_url', url + 'js/data/quizz/motivation.js'),
	('code_url', url + 'js/data/quizz/learningstyle.js'),
	('compilation_level', 'ADVANCED_OPTIMIZATIONS'),
	('language', 'ECMASCRIPT5'),
	('output_format', 'text'),
	('output_info', 'compiled_code'),
]

if (sys.argv[2] == "pretty"):
	arr.append(('formatting', 'pretty_print'))

params = urllib.urlencode(arr)

# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
data = response.read()
print data
conn.close()
