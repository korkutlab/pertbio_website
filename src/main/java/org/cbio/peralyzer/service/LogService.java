package org.cbio.peralyzer.service;

import flexjson.JSONSerializer;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;


public class LogService
{
	private Resource logResource;

	public Resource getLogResource()
	{
		return logResource;
	}

	public void setLogResource(Resource logResource)
	{
		this.logResource = logResource;
	}

	public String logDownload(String name, String organization, String purpose) throws IOException
	{
		String filename = this.getLogResource().getFile().getAbsolutePath();

		StringBuilder builder = new StringBuilder();

		builder.append("[");
		builder.append(new Date());
		builder.append("] Download request: ");
		builder.append(name);
		builder.append(" (");
		builder.append(organization);
		builder.append(")");
		builder.append(" / ");
		builder.append(purpose);
		builder.append("\n");

		if (!Files.exists(Paths.get(filename)))
		{
			Files.createFile(Paths.get(filename));
		}

		Files.write(Paths.get(filename),
		            builder.toString().getBytes(),
		            StandardOpenOption.APPEND);

		Map<String, String> map = new HashMap<>();

		map.put("log", builder.toString());

		return (new JSONSerializer()).serialize(map);
	}
}
