# ###################################################################
# Mp3tag Tag Source for Discogs API (Official)
#
# Search by is specified in host tag source that includes this file.
# 
# This file should be stored in your tag sources sources directory
# %APPDATA%\Mp3tag\data\sources
# and requires Mp3tag v2.97b or above.
#
# [2019-09-09] v1.13
# [2019-09-09]  CHG: moved common Discogs tag source structure to this tag source include file.
# [2019-05-23] v1.12
# [2019-05-23]  FIX: titles with pipe symbol were identified as different titles.
# [2019-03-15] v1.11
# [2019-03-15]  NEW: added support for subtracks.
# [2018-11-24] v1.10
# [2018-11-24]  FIX: artist and albumartist were wrong for releases where albumartist consists of multiple artists.
# [2018-05-07] v1.09
# [2018-05-07]  CHG: added all formats and catalog number
# [2018-04-10]  CHG: added support for track numbers and disc numbers from Discogs
# [2017-12-20] v1.08
# [2017-12-20]  FIX: releases with missing year had YEAR set to 0.
# [2017-10-16] v1.07
# [2017-10-14]  FIX: format descriptions were not imported into MEDIATYPE field.
# [2017-06-30] v1.06
# [2017-06-30]  CHG: added fallback detection of secondary images if no primary image exists
# [2017-06-28]  CHG: added check if query gave any results
# [2017-06-26] v1.05
# [2017-06-26]  CHG: extended result list to current API maximum of 100 releases
# [2017-06-15] v1.04
# [2017-06-15]  FIX: added a workaround for single artists with join
# [2016-01-31] v1.03
# [2016-01-31]  CHG: changed to use HTTPS
# [2014-10-26] v1.02
# [2014-10-26]  CHG: changed to use %20 as word separator
# [2014-10-03] v1.01
# [2014-10-03]  CHG: added image caching through proxy 
# [2014-09-28]  FIX: join was not interpreted correctly for artists
# [2014-09-20] v1.00
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
replace "|" "$verticalBar()"
json "ON" "current"

# First, check if we've found anything
json_select_object "pagination"
json_select "items"

# Then iterate over all releases
ifnot "0"
	json_unselect_object
	json_foreach "results"

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

	json_foreach_end
endif


[ParserScriptAlbum]=...
# ###################################################################
#					A  L  B  U  M
# ###################################################################
replace "|" "$verticalBar()"
json "ON" "current"

# Album
outputto "ALBUM"
json_select "title"
sayrest

# Discogs_Release_ID
outputto "DISCOGS_RELEASE_ID"
json_select "id"
sayrest

# Coverurl
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

# Catalog Number
outputto "CATALOGID"
json_select_many "labels" "catno" ", "
sayrest

# Publisher
outputto "PUBLISHER"
json_select_many "labels" "name" ", "
sayrest

# Media Type
outputto "MEDIATYPE"
json_foreach "formats"
	json_select "name"
	sayrest
	json_select_array "descriptions" -1 ", "
	ifnot ""
		say " ("
		sayrest
		say ")"
	endif
json_foreach_end

# Genre
outputto "GENRE"
json_select_array "genres" -1 ", "
sayrest

# Style
outputto "STYLE"
json_select_array "styles" -1 ", "
sayrest

# Country
outputto "COUNTRY"
json_select "country"
sayrest

# Year
outputto "YEAR"
json_select "year"
ifnot "0"
	sayrest
endif

# Www
outputto "WWW"
json_select "uri"
sayrest

# Artist or Albumartist
set "TEMP_Join"
outputto "TEMP_Artist"
json_foreach "artists"
	sayoutput "TEMP_Join"
	set "TEMP_Join"
	json_select "anv"
	ifnot ""
		sayrest
	else
		json_select "name"
		sayrest
	endif

	outputto "TEMP_Join"
	json_select "join"
	ifnot ""
		say " "
		sayrest
		say " "
	endif
	outputto "TEMP_Artist"
json_foreach_end

json_foreach "tracklist"
	json_select_many "artists" "name" ", "
json_foreach_end

ifnot ""
	## Various Artists
	outputto "ALBUMARTIST"
else
	## Single Artist
	outputto "ARTIST"
endif
sayoutput "TEMP_Artist"

# Tracks
json_foreach "tracklist"
	json_select "type_"

	if "index"
		json_select "title"
		set "TEMP_IndexTitle"
		outputto "TEMP_IndexTitle"
		sayrest
		say ", "

		json_foreach "sub_tracks"
			json_select "type_"
			if "track"
				json_select "position"
				findinline "-" 1 1
				outputto "TEMP_Track"
				movechar -1
				if "-"
					movechar 1
				else
					gotochar 1
				endif
				sayrest
				say "|"

				gotochar 1
				findinline "-" 1 1
				movechar -1
				if "-"
					gotochar 1
					outputto "Discnumber"
					sayregexp ".+" "" "-"
					say "|"
				endif

				outputto "TEMP_Title"
				sayoutput "TEMP_IndexTitle"
				json_select "title"
				sayrest
				say "|"
				outputto "tracks"
				say "|"

				outputto "_LENGTH"
				json_select "duration"
				sayrest
				say "|"

				json_select_many "artists" "name" ", "
				ifnot ""
					outputto "ARTIST"
					set "TEMP_Join"
					json_foreach "artists"
						sayoutput "TEMP_Join"
						set "TEMP_Join"
						json_select "anv"
						ifnot ""
							sayrest
						else
							json_select "name"
							sayrest
						endif

						outputto "TEMP_Join"
						json_select "join"
						ifnot ""
							say " "
							sayrest
							say " "
						endif
						outputto "ARTIST"
					json_foreach_end
					say "|"
				endif
			endif
		json_foreach_end
	endif

	if "track"
		json_select "position"
		findinline "-" 1 1
		outputto "TEMP_Track"
		movechar -1
		if "-"
			movechar 1
		else
			gotochar 1
		endif
		sayrest
		say "|"

		gotochar 1
		findinline "-" 1 1
		movechar -1
		if "-"
			gotochar 1
			outputto "Discnumber"
			sayregexp ".+" "" "-"
			say "|"
		endif

		outputto "TEMP_Title"
		json_select "title"
		sayrest
		say "|"
		outputto "tracks"
		say "|"

		outputto "_LENGTH"
		json_select "duration"
		sayrest
		say "|"

		json_select_many "artists" "name" ", "
		ifnot ""
			outputto "ARTIST"
			set "TEMP_Join"
			json_foreach "artists"
				sayoutput "TEMP_Join"
				set "TEMP_Join"
				json_select "anv"
				ifnot ""
					sayrest
				else
					json_select "name"
					sayrest
				endif

				outputto "TEMP_Join"
				json_select "join"
				ifnot ""
					say " "
					sayrest
					say " "
				endif
				outputto "ARTIST"
			json_foreach_end
			say "|"
		endif
	endif
json_foreach_end

outputto "Title"
sayoutput "TEMP_Title"

outputto "Track"
sayoutput "TEMP_Track"

set "TEMP_Artist"
set "TEMP_IndexTitle"
set "TEMP_Join"
set "TEMP_Title"
set "TEMP_Track"