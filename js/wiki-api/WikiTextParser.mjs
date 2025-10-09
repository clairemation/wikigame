-- Module:WikitextParser is a general-purpose wikitext parser
-- Documentation and master version: https://en.wikipedia.org/wiki/Module:WikitextParser
-- Authors: User:Sophivorus, User:Certes, User:Aidan9382, et al.
-- License: CC-BY-SA-4.0
local WikitextParser = {}

-- Private helper method to escape a string for use in regexes
local function escapeString( str )
	return string.gsub( str, '[%^%$%(%)%.%[%]%*%+%-%?%%]', '%%%0' )
end

-- Get the lead section from the given wikitext
-- The lead section is any content before the first section title.
-- @param wikitext Required. Wikitext to parse.
-- @return Wikitext of the lead section. May be empty if the lead section is empty.
function WikitextParser.getLead( wikitext )
	wikitext = '\n' .. wikitext
	wikitext = string.gsub( wikitext, '\n==.*', '' )
	wikitext = mw.text.trim( wikitext )
	return wikitext
end

-- Get the sections from the given wikitext
-- This method doesn't get the lead section, use getLead for that
-- @param wikitext Required. Wikitext to parse.
-- @return Map from section title to section content
function WikitextParser.getSections( wikitext )
	local sections = {}
	wikitext = '\n' .. wikitext .. '\n=='
	for title in string.gmatch( wikitext, '\n==+ *([^=]-) *==+' ) do
		local section = string.match( wikitext, '\n==+ *' .. escapeString( title ) .. ' *==+(.-)\n==' )
		section = mw.text.trim( section )
		sections[ title ] = section
	end
	return sections
end

-- Get a section from the given wikitext (including any subsections)
-- If the given section title appears more than once, only the section of the first instance will be returned
-- @param wikitext Required. Wikitext to parse.
-- @param title Required. Title of the section
-- @return Wikitext of the section, or nil if it isn't found. May be empty if the section is empty or contains only subsections.
function WikitextParser.getSection( wikitext, title )
	title = mw.text.trim( title )
	title = escapeString( title )
	wikitext = '\n' .. wikitext .. '\n'
	local level, wikitext = string.match( wikitext, '\n(==+) *' .. title .. ' *==.-\n(.*)' )
	if wikitext then
		local nextSection = '\n==' .. string.rep( '=?', #level - 2 ) .. '[^=].*'
		wikitext = string.gsub( wikitext, nextSection, '' ) -- remove later sections at this level or higher
		wikitext = mw.text.trim( wikitext )
		return wikitext
	end
end

-- Get the content of a <section> tag from the given wikitext.
-- We can't use getTags because unlike all other tags, both opening and closing <section> tags are self-closing.
-- @param wikitext Required. Wikitext to parse.
-- @param name Required. Name of the <section> tag
-- @return Content of the <section> tag, or nil if it isn't found. May be empty if the section tag is empty.
function WikitextParser.getSectionTag( wikitext, name )
	name = mw.text.trim( name )
	name = escapeString( name )
	wikitext = string.match( wikitext, '< *section +begin *= *["\']? *' .. name .. ' *["\']? */>(.-)< *section +end= *["\']? *'.. name ..' *["\']? */>' )
	if wikitext then
		return mw.text.trim( wikitext )
	end
end

-- Get the lists from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of lists.
function WikitextParser.getLists( wikitext )
	local lists = {}
	wikitext = '\n' .. wikitext .. '\n\n'
	for list in string.gmatch( wikitext, '\n([*#].-)\n[^*#]' ) do
		table.insert( lists, list )
	end
	return lists
end

-- Get the paragraphs from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of paragraphs.
function WikitextParser.getParagraphs( wikitext )
	local paragraphs = {}

	-- Remove non-paragraphs
	wikitext = '\n' .. wikitext .. '\n'
	wikitext = string.gsub( wikitext, '<!%-%-.-%-%->', '' ) -- remove comments
	wikitext = string.gsub( wikitext, '\n%[%b[]%]\n', '\n' ) -- remove files and categories
	wikitext = string.gsub( wikitext, '\n(%b{}) *(%b{}) *\n', '\n%1\n%2\n' ) -- separate neighboring tables and block templates
	wikitext = string.gsub( wikitext, '\n%b{} *\n', '\n%0\n' ) -- add spacing between tables and block templates
	wikitext = string.gsub( wikitext, '\n%b{} *\n', '\n' ) -- remove tables and block templates
	wikitext = string.gsub( wikitext, '\n[*#][^\n]*', '\n' ) -- remove lists
	wikitext = string.gsub( wikitext, '\n==+[^=]+==+ *\n', '\n' ) -- remove section titles
	wikitext = mw.text.trim( wikitext )

	for paragraph in mw.text.gsplit( wikitext, '\n\n+' ) do
		if mw.text.trim( paragraph ) ~= '' then
			table.insert( paragraphs, paragraph )
		end
	end
	return paragraphs
end

-- Get the templates from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of templates.
function WikitextParser.getTemplates( wikitext )
	local templates = {}
	for template in string.gmatch( wikitext, '{%b{}}' ) do
		if string.sub( template, 1, 3 ) ~= '{{#' then -- skip parser functions like #if
			table.insert( templates, template )
		end
	end
	return templates
end

-- Get the requested template from the given wikitext.
-- If the template appears more than once, only the first instance will be returned
-- @param wikitext Required. Wikitext to parse.
-- @param name Name of the template to get
-- @return Wikitext of the template, or nil if it wasn't found
function WikitextParser.getTemplate( wikitext, name )
	local templates = WikitextParser.getTemplates( wikitext )
	local lang = mw.language.getContentLanguage()
	for _, template in pairs( templates ) do
		local templateName = WikitextParser.getTemplateName( template )
		if lang:ucfirst( templateName ) == lang:ucfirst( name ) then
			return template
		end
	end
end

-- Get name of the template from the given template wikitext.
-- @param templateWikitext Required. Wikitext of the template to parse.
-- @return Name of the template
-- @todo Strip "Template:" namespace?
function WikitextParser.getTemplateName( templateWikitext )
	return string.match( templateWikitext, '^{{ *([^}|\n]+)' )
end

-- Get the parameters from the given template wikitext.
-- @param templateWikitext Required. Wikitext of the template to parse.
-- @return Map from parameter names to parameter values, NOT IN THE ORIGINAL ORDER.
-- @return Order in which the parameters were parsed.
function WikitextParser.getTemplateParameters( templateWikitext )
	local parameters = {}
	local paramOrder = {}
	local params = string.match( templateWikitext, '{{[^|}]-|(.*)}}' )
	if params then
		-- Temporarily replace pipes in subtemplates and links to avoid chaos
		for subtemplate in string.gmatch( params, '{%b{}}' ) do
			params = string.gsub( params, escapeString( subtemplate ), string.gsub( subtemplate, '.', { ['%']='%%', ['|']="@@:@@", ['=']='@@_@@' } ) )
		end
		for link in string.gmatch( params, '%[%b[]%]' ) do
			params = string.gsub( params, escapeString( link ), string.gsub( link, '.', { ['%']='%%', ['|']='@@:@@', ['=']='@@_@@' } ) )
		end
		local count = 0
		local parts, name, value
		for param in mw.text.gsplit( params, '|' ) do
			parts = mw.text.split( param, '=' )
			name = mw.text.trim( parts[1] )
			if #parts == 1 then
				value = name
				count = count + 1
				name = count
			else
				value = table.concat( parts, '=', 2 );
				value = mw.text.trim( value )
			end
			value = string.gsub( value, '@@_@@', '=' )
			value = string.gsub( value, '@@:@@', '|' )
			parameters[ name ] = value
			table.insert( paramOrder, name )
		end
	end
	return parameters, paramOrder
end

-- Get the tags from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of tags.
function WikitextParser.getTags( wikitext )
	local tags = {}
	local tag, tagName, tagEnd
	-- Don't match closing tags like </div>, comments like <!--foo-->, comparisons like 1<2 or things like <3
	for tagStart, tagOpen in string.gmatch( wikitext, '()(<[^/!%d].->)' ) do
		tagName = WikitextParser.getTagName( tagOpen )

		-- If we're in a self-closing tag, like <ref name="foo" />, <references/>, <br/>, <br>, <hr>, etc.
		if string.match( tagOpen, '<.-/>' ) or tagName == 'br' or tagName == 'hr' then
			tag = tagOpen

		-- If we're in a tag that may contain others like it, like <div> or <span>
		elseif tagName == 'div' or tagName == 'span' then
			local position = tagStart + #tagOpen - 1
			local depth = 1
			while depth > 0 do
				tagEnd = string.match( wikitext, '</ ?' .. tagName .. ' ?>()', position )
				if tagEnd then
					tagEnd = tagEnd - 1
				else
					break -- unclosed tag
				end 
				position = string.match( wikitext, '()< ?' .. tagName .. '[ >]', position + 1 )
				if not position then
					position = tagEnd + 1
				end
				if position > tagEnd then
					depth = depth - 1
				else
					depth = depth + 1
				end
			end
			tag = string.sub( wikitext, tagStart, tagEnd )

		-- Else we're probably in tag that shouldn't contain others like it, like <math> or <strong>
		else
			tagEnd = string.match( wikitext, '</ ?' .. tagName .. ' ?>()', tagStart )
			if tagEnd then
				tag = string.sub( wikitext, tagStart, tagEnd - 1 )

			-- If no end tag is found, assume we matched something that wasn't a tag, like <no. 1>
			else
				tag = nil
			end
		end
		table.insert( tags, tag )
	end
	return tags
end

-- Get the name of the tag in the given wikitext
-- @param tag Required. Tag to parse.
-- @return Name of the tag or nil if not found
function WikitextParser.getTagName( tagWikitext )
	local tagName = string.match( tagWikitext, '^< *(.-)[ />]' )
	if tagName then tagName = string.lower( tagName ) end
	return tagName
end

-- Get the value of an attribute in the given tag.
-- @param tagWikitext Required. Wikitext of the tag to parse.
-- @param attribute Required. Name of the attribute.
-- @return Value of the attribute or nil if not found
function WikitextParser.getTagAttribute( tagWikitext, attribute )
	local _quote, value = string.match( tagWikitext, '^<[^/>]*' .. attribute .. ' *= *(["\']?)([^/>]-)%1[ />]' )
	return value
end

-- Get the content of the given tag.
-- @param tagWikitext Required. Wikitext of the tag to parse.
-- @return Content of the tag. May be empty if the tag is empty. Will be nil if the tag is self-closing.
-- @todo May fail with nested tags
function WikitextParser.getTagContent( tagWikitext )
	return string.match( tagWikitext, '^<.->.-</.->' )
end

-- Get the <gallery> tags from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of gallery tags.
function WikitextParser.getGalleries( wikitext )
	local galleries = {}
	local tags = WikitextParser.getTags( wikitext )
	for _, tag in pairs( tags ) do
		local tagName = WikitextParser.getTagName( tag )
		if tagName == 'gallery' then
			table.insert( galleries, tag )
		end
	end
	return galleries
end

-- Get the <ref> tags from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of ref tags.
function WikitextParser.getReferences( wikitext )
	local references = {}
	local tags = WikitextParser.getTags( wikitext )
	for _, tag in pairs( tags ) do
		local tagName = WikitextParser.getTagName( tag )
		if tagName == 'ref' then
			table.insert( references, tag )
		end
	end
	return references
end

-- Get the reference with the given name from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @param referenceName Required. Name of the reference.
-- @return Wikitext of the reference
function WikitextParser.getReference( wikitext, referenceName )
	local references = WikitextParser.getReferences( wikitext )
	for _, reference in pairs( references ) do
		local content = WikitextParser.getTagContent( reference )
		local name = WikitextParser.getTagAttribute( reference, 'name' )
		if content and name == referenceName then
			return reference
		end
	end
end

-- Get the tables from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of tables.
function WikitextParser.getTables( wikitext )
	local tables = {}
	wikitext = '\n' .. wikitext
	for t in string.gmatch( wikitext, '\n%b{}' ) do
		if string.sub( t, 1, 3 ) == '\n{|' then
			t = mw.text.trim( t ) -- exclude the leading newline
			table.insert( tables, t )
		end
	end
	return tables
end

-- Get the id from the given table wikitext
-- @param tableWikitext Required. Wikitext of the table to parse.
-- @param attribute Required. Name of the attribute.
-- @return Value of the attribute or nil if not found
function WikitextParser.getTableAttribute( tableWikitext, attribute )
	local _quote, value = string.match( tableWikitext, '^{|[^\n]*' .. attribute .. ' *= *(["\']?)([^\n]-)%1[^\n]*\n' )
	return value
end

-- Get a table by id from the given wikitext
-- @param wikitext Required. Wikitext to parse.
-- @param id Required. Id of the table
-- @return Wikitext of the table or nil if not found
function WikitextParser.getTable( wikitext, id )
	local tables = WikitextParser.getTables( wikitext )
	for _, t in pairs( tables ) do
		if id == WikitextParser.getTableAttribute( t, 'id' ) then
			return t
		end
	end
end

-- Get the data from the given table wikitext
-- @param tableWikitext Required. Wikitext of the table to parse.
-- @return Table data
-- @todo Test and make more robust
function WikitextParser.getTableData( tableWikitext )
	local tableData = {}
	tableWikitext = mw.text.trim( tableWikitext );
	tableWikitext = string.gsub( tableWikitext, '^{|.-\n', '' ) -- remove the header
	tableWikitext = string.gsub( tableWikitext, '\n|}$', '' ) -- remove the footer
	tableWikitext = string.gsub( tableWikitext, '^|%+.-\n', '' ) -- remove any caption
	tableWikitext = string.gsub( tableWikitext, '|%-.-\n', '|-\n' ) -- remove any row attributes
	tableWikitext = string.gsub( tableWikitext, '^|%-\n', '' ) -- remove any leading empty row
	tableWikitext = string.gsub( tableWikitext, '\n|%-$', '' ) -- remove any trailing empty row
	for rowWikitext in mw.text.gsplit( tableWikitext, '|-', true ) do
		local rowData = {}
		rowWikitext = string.gsub( rowWikitext, '||', '\n|' )
		rowWikitext = string.gsub( rowWikitext, '!!', '\n|' )
		rowWikitext = string.gsub( rowWikitext, '\n!', '\n|' )
		rowWikitext = string.gsub( rowWikitext, '^!', '\n|' )
		rowWikitext = string.gsub( rowWikitext, '^\n|', '' )
		for cellWikitext in mw.text.gsplit( rowWikitext, '\n|' ) do
			cellWikitext = mw.text.trim( cellWikitext )
			table.insert( rowData, cellWikitext )
		end
		table.insert( tableData, rowData )
	end
	return tableData
end

-- Get the internal links from the given wikitext (includes category and file links).
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of internal links.
function WikitextParser.getLinks( wikitext )
	local links = {}
	for link in string.gmatch( wikitext, '%[%b[]%]' ) do
		table.insert( links, link )
	end
	return links
end

-- Get the file links from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of file links.
function WikitextParser.getFiles( wikitext )
	local files = {}
	local links = WikitextParser.getLinks( wikitext )
	for _, link in pairs( links ) do
		local namespace = string.match( link, '^%[%[ *(.-) *:' )
		if namespace and mw.site.namespaces[ namespace ] and mw.site.namespaces[ namespace ].canonicalName == 'File' then
			table.insert( files, link )
		end
	end
	return files
end

-- Get name of the file from the given file wikitext.
-- @param fileWikitext Required. Wikitext of the file to parse.
-- @return Name of the file
function WikitextParser.getFileName( fileWikitext )
	return string.match( fileWikitext, '^%[%[ *.- *: *(.-) *[]|]' )
end

-- Get the category links from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of category links.
function WikitextParser.getCategories( wikitext )
	local categories = {}
	local links = WikitextParser.getLinks( wikitext )
	for _, link in pairs( links ) do
		local namespace = string.match( link, '^%[%[ -(.-) -:' )
		if namespace and mw.site.namespaces[ namespace ] and mw.site.namespaces[ namespace ].canonicalName == 'Category' then
			table.insert( categories, link )
		end
	end
	return categories
end

-- Get the external links from the given wikitext.
-- @param wikitext Required. Wikitext to parse.
-- @return Sequence of external links.
function WikitextParser.getExternalLinks( wikitext )
	local links = {}
	for link in string.gmatch( wikitext, '%b[]' ) do
		if string.match( link, '^%[//' ) or string.match( link, '^%[https?://' ) then
			table.insert( links, link )
		end
	end
	return links
end

return WikitextParser
