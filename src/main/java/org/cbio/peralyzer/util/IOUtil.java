package org.cbio.peralyzer.util;

public class IOUtil
{
	public static String FILENAME_PATTERN = "[a-zA-Z0-9_\\-\\|]+";

	public static boolean isValidFilename(String filename)
	{
		return isValidFilename(filename, FILENAME_PATTERN);
	}

	public static boolean isValidFilename(String filename, String pattern)
	{
		return filename.matches(pattern);
	}
}
