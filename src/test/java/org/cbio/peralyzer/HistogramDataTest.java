package org.cbio.peralyzer;

import junit.framework.TestCase;

import java.io.File;
import java.io.IOException;

public class HistogramDataTest extends TestCase
{
	private static String[] nodes = {"4EBP1pS65", "4EBP1pT37", "4EBP1pT70",
			"ACC1", "ACCpS79", "AKT", "AKTpS473", "AKTpT308",
			"AMPKpT172", "ATMpS1981", "ATR", "BAK", "BCL-XL",
			"BCL2", "BIM", "CHK1pS345", "CHK2pT68", "COX2",
			"Casp9cAsp31", "Caspase9", "Caveolin", "Collagenase",
			"CyclinB1", "CyclinD1", "CyclinE1", "EGFRV", "ELK1pS383",
			"ERa", "Fibronectin", "GATA3", "GSK3ab", "GSK3abpS21",
			"GSKpS9", "HSP27", "IGF1R-beta", "IGFBP2", "IRS1",
			"IRS1pS307", "MAPKpT202", "MEKpS217", "PAI-1", "PAX2",
			"PCNA", "PDK1pS241", "PI3Kp85", "PKCa", "PLK1", "RAD51",
			"RbpS807", "S6", "S6pS235", "S6pS240", "SMAD3", "SMAD3pS423",
			"SRC", "SRCpY416", "SRCpY527", "STAT3", "STAT3pY705", "STAT5",
			"STAT5pY694", "STAT6pY641", "TAZpS89", "TSC2", "TSC2pT1462",
			"XRCC1", "YAPpS127", "YBIpS102", "a-tubulin", "aAKT", "aBRAFm",
			"aCDK4", "aHDAC", "aJAK", "aMDM2", "aMEK", "aPI3K", "aPKC",
			"aSRC", "aSTAT3", "amTOR", "b-Catenin", "b-CateninpS", "bRAF",
			"c-JUNpS73", "c-Myc", "cRAFV", "mTORpS2448", "p21", "p27", "p38",
			"p38pT180", "p53", "p70S6KpT389"};

	private static String dataDirectory = "/data/peralyzer/histogram_data";

	public void testSimulationFiles() throws IOException
	{

		for (int i=0; i < nodes.length; i++)
		{
			for (int j=0; j < nodes.length; j++)
			{
				String file1path;
				String file2path;

				for (int k=1; k < 5; k++)
				{
					for (int l=1; l < 5; l++)
					{
						if (i == j)
						{
							file1path = file2path = dataDirectory +
											"/predict_" + nodes[i] + "_" + k + ".json";
						}
						else
						{
							file1path = dataDirectory +
							         "/predict_" + nodes[i] + "_" + nodes[j] + "_" +
							         k + "_" + l + ".json";

							file2path = dataDirectory +
							        "/predict_" + nodes[j] + "_" + nodes[i] + "_" +
							        k + "_" + l + ".json";
						}

						File file1 = new File(file1path);
						File file2 = new File(file2path);

						String msg = "Either " + file1path + " or " + file2path + " must exist.";
						boolean condition = file1.exists() || file2.exists();

						assertTrue(msg, condition);
					}
				}
			}
		}
	}
}
