# ###################################################################
# Mp3tag Tag Source for Cover Art from Discogs API (Official)
#
# Search by is specified in host tag source that includes this file.
# 
# This file should be stored in your tag sources sources directory
# %APPDATA%\Mp3tag\data\sources
# and requires Mp3tag v2.97b or above.
#
# [2019-09-09] v1.04
# [2019-09-09]  CHG: moved common Discogs tag source structure to this tag source include file.
# [2018-05-07] v1.03
# [2018-05-07]  CHG: added all formats and catalog number
# [2017-06-30] v1.02
# [2017-06-30]  CHG: added fallback detection of secondary images if no primary image exists
# [2017-06-27] v1.01
# [2017-06-27]  CHG: improved detection if release has cover art
# [2017-06-26] v1.00
#
# ###################################################################

[Name]=Discogs.com
[BasedOn]=www.discogs.com
[IndexUrl]=https://api.discogs.com/database/search?type=release&per_page=100
[AlbumUrl]=
[WordSeparator]=%20
[IndexFormat]=%Artist%|%Album%|%_url%|%Format%|%Year%|%Label%|%Catalog%|%Country%|%_preview%
[UserAgent]=1
[Encoding]=url-utf-8

[ParserScriptIndex]=...
# ###################################################################
#					I  N  D  E  X
# ###################################################################
json "ON"

json_foreach "results"

	# Check if release has cover art
	json_select "thumb"

	ifnot ""
	
		# Artist
		json_select "title"
		sayregexp ".+?(?= -.*)"
		say "|" 

		# Album
		sayregexp "(?<= - ).*"
		say "|"

		# URL
		json_select "resource_url"
		sayrest
		say "|"

		# Format
		json_select_array "format" -1 ", "
		sayrest
		say "|"

		# Year
		json_select "year"
		sayrest
		say "|"

		# Label
		json_select_array "label" 1
		sayrest
		say "|"

		# Catno
		json_select "catno"
		sayrest
		say "|"

		# Country
		json_select "country"
		sayrest
		say "|"

		# Preview
		say "http://www.discogs.com/release/"
		json_select "id"
		sayrest

		saynewline

	endif

json_foreach_end


[ParserScriptAlbum]=...
# ###################################################################
#					A  L  B  U  M
# ###################################################################
json "ON"

json_foreach "images"
	json_select "type"
	if "primary"
		ifnotoutput "TMP_PRIMARY"
			outputto "TMP_PRIMARY"
			json_select "uri"
			say "http://cache.mp3tag.de/coxy"
			sayregexp "(?<=\.com).*"
		endif
	endif
	if "secondary"
		ifnotoutput "TMP_SECONDARY"
			outputto "TMP_SECONDARY"
			json_select "uri"
			say "http://cache.mp3tag.de/coxy"
			sayregexp "(?<=\.com).*"
		endif
	endif
json_foreach_end

outputto "coverurl"
ifoutput "TMP_SECONDARY"
	set "coverurl"
	sayoutput "TMP_SECONDARY"
	set "TMP_SECONDARY"
endif
ifoutput "TMP_PRIMARY"
	set "coverurl"
	sayoutput "TMP_PRIMARY"
	set "TMP_PRIMARY"
endif